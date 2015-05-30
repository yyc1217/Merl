/**
* IgnoreRound.js
*
* @description :: 某隊已放棄的輪次
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
			required: true,
			columnName: 'official_draft_no'
		},
		
		/* 隊伍 */
		team: {
			type : 'string',
			required: true
		},
		
		/* 輪次 */
		round: {
			type : 'integer',
			required: true
		}
	},
		
};