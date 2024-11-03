## I am building a trading journal app for traders to log their trades and analyze their performance. I need to build a feature to generate reports and charts based on the trades logged by the user. The app has the following features:

* Import trades from CSV
    * First step is I parse the CSV which could be from any broker.
    * Second is convert it to Executions and Trades, while doing that I fill in the missing data or enhance the data.
* User will have an advanced filter options which will work for any page user in.
    * Most common is Date Range, Ticker, Side, PnL and Type of Display unit ($, %, R-Multiple) and PnL Type (Gross, Net)
* Now I need to design pages for the following features:
    * Dashboard : This will be displaying the following:
        * Overall Stats for trader for all trades from the beggining or based on the filter
        * Which includes all type of stats ; Total Trades, Win Rate, Avg PnL, Avg Holding Time, Avg Daily Volume,
          Cumulative Drowdown, Daily PnL Chart, Daily Cumulative PnL Chart
        * On the calendar I will show the days with trades and when user clicks it will show the trades for that day.
          And the same stats as above but for that day.
    * Day View
        * This is the page that opens when user clicks on a day on the calendar. Will display same stats on dashboard
          but for that day.
        * Also will show the list of trades for that day with OpenTime, Ticker, Side, PnL, ROI, R-Multiple, Tags as
          columns
        * Users will be able to click on a trade to view the details of that trade
    * Trade View
        * This is the page that opens when user clicks on a trade from Day View
        * Will show the details of the trade like OpenDate, CloseDate, Ticker,Status, Entry Price, Exit Price, Side,
          PnL, ROI, R-Multiple, Tags,
    * Trade List
        * This is the page user can bulk edit trades, delete trades, add notes to trades, add tags to trades
    * Reports
        * This page will display the reports and charts based on the trades logged by the user, like:
            * Trade Distribution by Day of Week / Month of Year
                * Bar chart with Day of Week on x-axis and Trade Count on y-axis
                * Required data: {DayOfWeek: String, TradeCount: Int}[]
            * Performance by Day of Weeka/ Month of Year
                * Bar chart with Day of Week on x-axis and PnL on y-axis
                * Required data: {DayOfWeek: String, PnL: Float}[]

Now given that information, this requires alot of transformation and calculation. I need to design the data model, api
model, cashing strategy so that I can build the UI on top of it.
Right now I get all trades from server and calculate the stats on the client side. But this is not efficient and I need
to do it on the server side. So I need to design the data model and api model so that I can get the data in the format I
need to build the UI.
I try to precalculate daily, monthly, yearly stats and store them in the database so that I can get them quickly when
user filters the data. I also need to design the caching strategy so that I can cache the data for a certain period of
time and invalidate the cache when user logs a new trade.
Problem with that is lets say user chosen a date range and chosen R-Multiple as the display unit. Now I need to
calculate the stats for that date range and display them. This causes issues if I store them as $ and if user wants R-Multiple 
I need to recalculate them.
How can I design my application to fix these type of information.

# You add custom tagging

    * You can tag trades with Eg: Setup Time frame, Strategy and view charts with these tags for both distribution and performance

# On Day View:

    * List of trades with OpenTime, Ticker, Side, PnL, ROI, R-Multiple, Tags as columns
    * You can add notes to each day and make them visible on calendar.

# On Trade View:

    * List of Trades with OpenDate, CloseDate, Ticker,Status, Entry Price, Exit Price, Side, PnL, ROI, R-Multiple, Tags, Fx Score as columns

# Reports

    * Avg Daily Volume Int
    * Cumulative Drowdown

## Report Charts

    * Days 
      * Trade Distribution by Day of Week / Month of Year
        * Bar chart with Day of Week on x-axis and Trade Count on y-axis 
        * Required data: {DayOfWeek: String, TradeCount: Int}[]
      * Performance by Day of Weeka/ Month of Year
        * Bar chart with Day of Week on x-axis and PnL on y-axis
        * Required data: {DayOfWeek: String, PnL: Float}[]
      * Trade Distribution by Hour of Day
        * Bar chart with Hour of Day on x-axis and Trade Count on y-axis. Hours will be in 24-hour format and 1 hour interval
        * Required data: {HourOfDay: Int, TradeCount: Int}[]
      * Performance by Hour of Day
        * Bar chart with Hour of Day on x-axis and PnL on y-axis. Hours will be in 24-hour format and 1 hour interval
        * Required data: {HourOfDay: Int, PnL: Float}[]
      * Trade Distribution by Duration
        * Bar chart with Duration on x-axis and Trade Count on y-axis. Duration will be in minutes like Under 1min, 1-2, 2-5, 5-10 , 10-30 ...
        * Required data: {Duration: Int, TradeCount: Int}[]
      * Performance by Duration
        * Bar chart with Duration on x-axis and PnL on y-axis. Duration will be in minutes like Under 1min, 1-2, 2-5, 5-10 , 10-30 ...
        * Required data: {Duration: Int, PnL: Float}[]
      * Trade Distribution by Volume
        * Bar chart with Volume on x-axis and Trade Count on y-axis. Volume will be in range like Under 100, 100-500 
        * Required data: {Volume: Int, TradeCount: Int}[]
      * Performance by Volume
        * Bar chart with Volume on x-axis and PnL on y-axis. Volume will be in range like Under 100, 100-500 
        * Required data: {Volume: Int, PnL: Float}[]
      * Trade Distribution by Price Range
        * Bar chart with Price Range on x-axis and Trade Count on y-axis. Price Range will be in range like Under 10, 10-20, 20-50, 50-100
        * Required data: {PriceRange: Int, TradeCount: Int}[]
      * Performance by Price Range
        * Bar chart with Price Range on x-axis and PnL on y-axis. Price Range will be in range like Under 10, 10-20, 20-50, 50-100
        * Required data: {PriceRange: Int, PnL: Float}[]
      * Trade Distribution by Ticker
        * Bar chart with Ticker on x-axis and Trade Count on y-axis. Show top 10 tickers by trade count
        * Required data: {Ticker: String, TradeCount: Int}[]
      * Performance by Ticker
        * Bar chart with Ticker on x-axis and PnL on y-axis. Show top 10 tickers by PnL
        * Required data: {Ticker: String, PnL: Float}[]
      * Trade Distribution by Tag
        * Bar chart with Tag on x-axis and Trade Count on y-axis. Show top 10 tags by trade count
        * Required data: {Tag: String, TradeCount: Int}[]
      * Performance by Tag
        * Bar chart with Tag on x-axis and PnL on y-axis. Show top 10 tags by PnL
        * Required data: {Tag: String, PnL: Float}[]