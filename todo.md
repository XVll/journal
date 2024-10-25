# You add custom tagging
    * You can tag trades with Eg: Setup Time frame, Strategy and view charts with these tags for both distribution and performance

# Todo Widgets for journaling app

[x] Total PnL  : 
  * Value type: float eg 1000$  
  * Chart to use : No chart
  * This is the total profit or loss that a trader has made over a given period of time. It is calculated by taking the sum of all the profits and losses from each trade. The formula is as follows:
    ```
        Total PnL = Sum of all profits - Sum of all losses
    ```

[x] Trade Win/Loose Rate :
  * Value type: float eg 70% with Win: 7 Loss: 3 Breakeven: 0
  * Chart to use : Pie chart
  * This is the percentage of trades that a trader has won, lost or breakeven over a given period of time. It is calculated by taking the number of winning trades and dividing it by the total number of trades, the number of losing trades and dividing it by the total number of trades, and the number of breakeven trades and dividing it by the total number of trades. The formula is as follows:
    ```
        Win Rate = Number of winning trades / Total number of trades
        Loss Rate = Number of losing trades / Total number of trades
        Breakeven Rate = Number of breakeven trades / Total number of trades
    ```
[x] Profit Factor : 
  * Value type: float eg 1.5
  * Chart to use : No chart
  * This is the ratio of the total profit to the total loss that a trader has made over a given period of time. It is calculated by taking the sum of all the profits and dividing it by the sum of all the losses. The formula is as follows:
    ```
        Profit Factor = Sum of all profits / Sum of all losses
    ```

[x] Average Win/Loss Trade : 
    * Value type: Win: float eg 100$ Loss: float eg 50$
    * Chart to use : Stacked bar chart
    * This is the average amount that a trader wins or loses on each trade. It is calculated by taking the sum of all the profits and dividing it by the number of winning trades, and taking the sum of all the losses and dividing it by the number of losing trades. The formula is as follows:
    ```
        Average Win Trade = Sum of all profits / Number of winning trades
        Average Loss Trade = Sum of all losses / Number of losing trades
    ```

[x] Trade Expectancy : 
  * Value type: float eg 10$
  * Chart to use : No chart
  * This is the average amount that a trader can expect to win or lose per trade, based on their trading strategy. It is calculated by taking the average of the win rate multiplied by the average win and the loss rate multiplied by the average loss. The formula is as follows:
    ```
        Trade Expectancy = (Win Rate * Average Win) - (Loss Rate * Average Loss)
    ```

[s] Daily PnL :
  * {Pnl:Float, Day:Date}[] eg [{100$, 2021-01-01}, {-200$, 2021-01-02}]
  * Chart to use : Bar chart date on x-axis and PnL on y-axis
  * This is the profit or loss that a trader has made on each day over a given period of time. It is calculated by taking the sum of all the profits and losses from each trade on each day. The formula is as follows:
        ```
            Daily PnL = Sum of all profits and losses on each day
        ```
[x] Daily Cumulative PnL :
  * Chart to use : Area chart date on x-axis and PnL on y-axis
  * {Pnl:Float, Day:Date}[] eg [{100$, 2021-01-01}, {-100$, 2021-01-02}]
  * This is the cumulative profit or loss that a trader has made on each day over a given period of time. It is calculated by taking the sum of all the profits and losses from each trade on each day and adding it to the previous day's cumulative profit or loss. The formula is as follows:
        ```
            Daily Cumulative PnL = Sum of all profits and losses on each day + Previous day's cumulative profit or loss
        ```

[] Daily Calendar PnL and Trade Count:
  * {Pnl:Float, TradeCount:Int, Day:Date}[] eg [{100$, 10, 2021-01-01}, {-200$, 5, 2021-01-02}]
  * Chart to use : No chart, display on a calendar
  * This is the profit or loss and the number of trades that a trader has made on each day over a given period of time. It is calculated by taking the sum of all the profits and losses from each trade on each day and the number of trades on each day. The formula is as follows:
        ```
            Daily Calendar PnL = Sum of all profits and losses on each day
            Daily Calendar Trade Count = Number of trades on each day
        ```
[] Fx Trading Score :
  * Chart to use : Radar chart
  * Value type: float as percentage eg 80% over 100%
  * This is proprietary score that measures the overall performance of a trader in the market. It is calculated by taking into account various factors such as win rate, profit factor, average win/loss trade and for consistency consecutive winning/loosing days and trades. The formula is as follows:
    ```
        Fx Trading Score = (Win Rate * 0.3) + (Profit Factor * 0.3) + (Average Win Trade * 0.2) + (Daily PnL * 0.2)
    ```



# On Day View:
    * Daily Area Chart which shows Daily PnL
    * Total Trades Count
    * Daily Winning/Losing/Breakeven Trade % and count
    * Total PnL
    * Total Commission/Fees
    * Total Volume
    * Daily Profit Factor
    * List of trades with OpenTime, Ticker, Side, PnL, ROI, R-Multiple, Tags as columns
    * You can add notes to each day and make them visible on calendar.

# On Trade View:
    * List of Trades with OpenDate, CloseDate, Ticker,Status, Entry Price, Exit Price, Side, PnL, ROI, R-Multiple, Tags, Fx Score as columns

# Reports
    * Total PnL $
    * Avg Trade PnL $
    * Avg Daily/Monthly PnL $
    * Avg Winning/Loosing Day PnL $
    * Largest Profitable/Loss Day $
    * Avg Planned R-Multiple
    * Avg Actual R-Multiple
    * Trade Expectancy $
    * Profit Factor
    * Total Trading Days Int
    * Winning/Loosing/Breakeven Days Int
    * Max consecutive Win/Loose Days Int
    * Avg Daily Volume Int
    * Avg Winning/Loosing Trade $
    * Total Number of Trades Int
    * Number of Winning/Loosing/Breakeven Trades %/Int
    * Max Consecutive Wins/Looses Int
    * Total Commission/Fees $
    * Largest Gain/Loss $
    * Avg Holding Time
    * Avg Holding Time for Winning/Loosing/Scratch Trades
## Report Charts
    * Days 
      * Trade Distribution by Day of Week
        * Bar chart with Day of Week on x-axis and Trade Count on y-axis 
        * Required data: {DayOfWeek: String, TradeCount: Int}[]
      * Performance by Day of Week
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