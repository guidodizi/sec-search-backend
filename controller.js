const parseString = require("xml2js").parseString;
const request = require("request");

function requestEdgar(company, page) {
  return new Promise((resolve, reject) => {
    request(
      `https://www.sec.gov/cgi-bin/browse-edgar?CIK=${company}&owner=exclude&action=getcompany&output=xml&start=${page *
        40}&count=40`,
      { headers: { Accept: "application/xml" } },
      (err, resp, body) => {
        if (!err && resp.statusCode === 200) {
          resolve(body);
        } else {
          reject(new Error("Request to edgar failed"));
        }
      }
    );
  });
}

function parseXml(edgar) {
  return new Promise((resolve, reject) => {
    parseString(edgar, (err, result) => {
      if (err) reject(new Error("Error parsing Edgar xml"));
      else resolve(result);
    });
  });
}

exports.get_fillings = async function(req, res) {
  let page = req.params.page ? req.params.page : 0;

  if (!/^[a-zA-Z]+$/.test(req.params.company)) {
    return res.status(400).json({
      result: {},
      errors: ["Company's trading symbol must be only alphabetical "]
    });
  }
  try {
    const edgar = await requestEdgar(req.params.company, page);
    try {
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
          //Response has no filings, only name. This could be because count exceeded existing filings
        } else {
          return res.status(200).json({
            result: {
              name: result.companyFilings.companyInfo[0].name[0],
              filings: []
            },
            errors: []
          });
        }
        //any other case
      } else {
        throw new Error("Error parsing Edgar xml");
      }
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        result: {},
        errors: [
          "There was error while parsing the company's data, maybe there is a typo on the trading symbol?"
        ]
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      result: {},
      errors: ["There was an error requesting data to Edgar"]
    });
  }
};

exports.wrong_resquest = (req, res) => {
  res.json({
    result: {},
    errors: ["Please provide a company by its trading symbol and optionally a page"]
  });
};
