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

  request(
    `https://www.sec.gov/cgi-bin/browse-edgar?CIK=${
      req.params.company
    }&owner=exclude&action=getcompany&output=xml&start=${page * 40}&count=${++page * 40}`,
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
