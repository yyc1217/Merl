/**
* Team.js
*
* @description :: 隊伍
* @docs        :: http://sailsjs.org/#!documentation/models
*/
module.exports = {

  attributes: {
	no: {
		type : 'integer',
		primaryKey: true,
		autoIncrement: true,
	},
	
	/* 英文名稱 */
	ename: {
		type : 'string',
		required: true
	},
	
	/* 中文名稱 */
	cname: {
		type : 'string',
		required: true
	},
	
	/* 選秀的順位 */
	order: {
		type : 'integer',
		required: true
	},
	
	/* 官方選秀 */
	officialDraftNo: {
		type : 'integer',
		required: true,
		columnName: 'official_draft_no'
	},
  }
};

