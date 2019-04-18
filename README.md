# Sec-Search-Backend

![Sec image](https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Seal_of_the_United_States_Securities_and_Exchange_Commission.svg/220px-Seal_of_the_United_States_Securities_and_Exchange_Commission.svg.png)

NodeJS project for searching companies SEC filings based on their trading symbol.

## Project

To run this project locally, run:
`npm start`

A deployed api of this code can be found at [Sec-Search-Backend](https://sec-search-backend.herokuapp.com)

## Basic API Documentation

### Parameters
There are two parameters for the API:
  * `company: string` - Company trading symbol, this could be *aapl* for Apple Inc, *msft* for Microsoft, etc.
  * `page?: number` - this parameter is *optional*, if not given, will default to 0. A page that exceeds count of available filings will return an empty array of filings
 
 ### Route
  `https://sec-search-backend.herokuapp.com/{company}/{page?}`
  
