# Merl 
模擬選秀系統

## Architecture
- [sails.js](http://sailsjs.org), 一個基於Nodejs的框架
- Socket.io, 用以達成即時通訊
- EJS, 產生頁面

## Development
- 修改[connection.js](config/connections.js)裡的adapter, username和password
- 修改[http.js](config/http.js)裡的clientID, clientSecret和callbackURL, 若要測試Facebook或Google+登入。
- 用`sails lift`, `node app.js`, `pm2 start app.js`, `forever start app.js`(如果使用pm2或forever)啟動server, 預設網址為localhost:1337

### Configurations
- see [draft.js](config/draft.js).

## Component

StageManager.js
> 使用無限狀態機Finite State Machine)來控制選秀流程，參考[StateManager.js](api/hooks/StateManager/StateManager.js)

RoundIterator.js
> 輔助StageManager.js控制輪次的進行，判斷選秀是否終止等，參考[RoundIterator.js](api/hooks/StateManager/RoundIterator.js)

TeamManagerRelation
> 控制使用者所代表的隊伍，參考[TeamManagerRelation](api/hooks/TeamManagerRelation/index.js)

Models
- OfficialDraft 官方選秀
    - Draft 依照CPBL官方選秀產生的模擬選秀
- Round 輪次
    - IgnoreRound 某隊已放棄的輪次
- Team 隊伍
- Manager 使用者代表的隊伍
- Candidate 候選球員
    - IgnoreCandidate 某隊不能選的球員
    - PreSelectedCandidate 預先被某隊選走的球員
- Pick 投單
- Result 模擬選秀的結果

## Contribution
- 有任何意見歡迎建立issue
- 歡迎發PR，但請詳述commit內容
- 不接受的PR類型：格式修改(Ctrl+Shift+F)、註解修改等，除非經過討論或有工具輔助