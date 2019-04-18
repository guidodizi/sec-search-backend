const parseString = require("xml2js").parseString;
const request = require("request");

function requestEdgar(company, page) {
  return new Promise((resolve, reject) => {
    request(
      `https://www.sec.gov/cgi-bin/browse-edgar?CIK=${company}&owner=exclude&action=getcompany&output=xml&start=${page *
        40}&count=40`,
      { headers: { Accept: "application/xml" } },
      (err, resp, body) => {
        if (!err && resp.statusCode === 200) resolve(body);
        else {
          const error = new Error("There was an error requesting data to Edgar");
          error.status = 400;
          reject(error);
        }
      }
    );
  });
}

function parseXml(edgar) {
  return new Promise((resolve, reject) => {
    parseString(edgar, (err, result) => {
      if (err) {
        const error = new Error(
          "There was error while parsing the company's data, maybe there is a typo on the trading symbol?"
        );
        error.status = 400;
        reject(error);
      } else resolve(result);
    });
  });
}

exports.get_fillings = async function(req, res, next) {
  let page = req.params.page ? req.params.page : 0;
  if (!/^[a-zA-Z]+$/.test(req.params.company)) {
    const err = new Error("Company's trading symbol must be only alphabetical ");
    err.status = 400;
    next(err);
  }
  try {
    const edgar = await requestEdgar(req.params.company, page);
    const result = await parseXml(edgar);
    if (result) {
      if (result.companyFilings.results && result.companyFilings.results.length === 1) {
        const filings = result.companyFilings.results[0].filing.map(f => ({
          dateFiled: f.dateFiled ? f.dateFiled[0] : "-- Empty data --",
          filingHREF: f.filingHREF ? f.filingHREF[0] : "-- Empty data --",
          formName: f.formName ? f.formName[0] : "-- Empty data --",
          type: f.type ? f.type[0] : "-- Empty data --"
        }));
        return res.status(200).json({
          result: {
            name: result.companyFilings.companyInfo[0].name[0],
            filings: filings
          },
          errors: []
        });
        // Response has no filings, only name. This could be because count exceeded existing filings
      } else {
        return res.status(200).json({
          result: {
            name: result.companyFilings.companyInfo[0].name[0],
            filings: []
          },
          errors: []
        });
      }
      // any other case
    } else {
      next(new Error("Error parsing Edgar xml"));
    }
  } catch (err) {
    next(err);
  }
};

exports.wrong_resquest = (req, res, next) => {
  next(new Error("Please provide a company by its trading symbol and optionally a page"));
};
