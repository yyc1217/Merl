/**
* Manager.js
*
* @description :: 使用者在模擬選秀中，選擇代表的隊伍
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
	attributes : {
		no: {
			type : 'integer',
			primaryKey: true,
			autoIncrement: true
		},

		/* 使用者id */
		uid : {
			type : 'string',
			required : true
		},
		
		/* 隊伍 */
		team : {
			type : 'string',
			required : true
		}
	}
};