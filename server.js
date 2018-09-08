const express = require("express");
const request = require("request");
const cors = require("cors");
var parseString = require("xml2js").parseString;

const app = express();
app.use(cors());

const wrong_resquest = (req, res) => {
  res.json({
    result: {},
    errors: ["Please provide a company by its trading symbol and optionally a page"]
  });
};

app.get("/:company/:page?", (req, res) => {
  let page = req.params.page ? req.params.page : 0;

  if (!/^[a-zA-Z]+$/.test(req.params.company)) {
    return res.json({
      result: {},
      errors: ["Company's trading symbol must be only alphabetical "]
    });
  }
  request(
    `https://www.sec.gov/cgi-bin/browse-edgar?CIK=${
      req.params.company
    }&owner=exclude&action=getcompany&output=xml&start=${page * 40}&count=40`,
    { headers: { Accept: "application/xml" } },
    (err, resp, body) => {
      if (err) {
        console.log(err);
      }
      parseString(body, (err, result) => {
        if (err) {
          res.json({
            result: {},
            errors: ["There was error while retrieving the company's data"]
          });
        }
        if (result) {
          if (result.companyFilings.results && result.companyFilings.results.length === 1) {
            const filings = result.companyFilings.results[0].filing.map(f => ({
              dateFiled: f.dateFiled ? f.dateFiled[0] : "-- Empty data --",
              filingHREF: f.filingHREF ? f.filingHREF[0] : "-- Empty data --",
              formName: f.formName ? f.formName[0] : "-- Empty data --",
              type: f.type ? f.type[0] : "-- Empty data --"
            }));
            res.json({
              result: {
                name: result.companyFilings.companyInfo[0].name[0],
                filings: filings
              },
              errors: []
            });
            //Response has no filings, only name. This could be because count exceeded existing filings
          } else {
            res.json({
              result: {
                name: result.companyFilings.companyInfo[0].name[0],
                filings: []
              },
              errors: []
            });
          }
        } else {
          res.json({
            result: {},
            errors: ["There was error while retrieving the company's data"]
          });
        }
      });
    }
  );
});

app.get("*", wrong_resquest);

app.listen(process.env.PORT || 5000, () => console.log("Server up & running"));
