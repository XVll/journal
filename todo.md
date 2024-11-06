# You add custom tagging
    * You can tag trades with Eg: Setup Time frame, Strategy and view charts with these tags for both distribution and performance
# Reports
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