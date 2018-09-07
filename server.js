const express = require("express");
const request = require("request");
const cors = require("cors");
var parseString = require("xml2js").parseString;

const app = express();
app.use(cors());

app.get("/:company/:page?", (req, res) => {
  const page = req.params.page ? req.params.page : 0;
  request(
    `https://www.sec.gov/cgi-bin/browse-edgar?CIK=${
      req.params.company
    }&owner=exclude&action=getcompany&output=xml&start=${page * 40}&count=${(page + 1) * 40}`,
    { headers: { Accept: "application/xml" } },
    (err, resp, body) => {
      if (err) {
        console.log(err);
      }
      parseString(body, (err, result) => {
        if (err) {
          console.log(err);
        }
        if (result) {
          res.json({
            result: {
              name: result.companyFilings.companyInfo[0].name,
              fillings: result.companyFilings.results[0].filing
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

app.listen(3000, () => console.log("Listening on 3000"));
