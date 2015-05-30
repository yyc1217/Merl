/**
* preSelectedCandidate.js
*
* @description :: 已預先選好的球員
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
	no: {
		type : 'integer',
		primaryKey: true,
		autoIncrement: true
	},
	
	/* 官方選秀 */
	officialDraftNo: {
		type : 'integer',
		required : true,
		columnName : 'official_draft_no'
	},
	
	/* 隊伍*/
	team : {
		type : 'string',
		enum : [ 'lion', 'elephant', 'rhino', 'monkey']
	},
	
	/* 已預先選擇的球員名稱 */
	name : {
		type : 'string',
	},

  }
};

