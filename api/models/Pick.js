/**
* Pick.js
*
* @description :: 使用者在每個輪次的指名
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {
		no: {
			type : 'integer',
			primaryKey: true,
			autoIncrement: true
		},

		/* 模擬選秀的id */
		draftNo: {
			type : 'integer',
			required : true,
			columnName : 'draft_no'
		},

		/* 輪次 */
		round : 'integer',

		/* 隊伍 */
		team : 'string',

		/* 候選人名稱 */
		name : 'string',

		/* 使用者id */
		uid : 'string',
		
		/* 已刪除的投單。可能為該輪次有票數相同的情況，則前一次投單要作廢 */
		isDeleted: {
			type: 'boolean',
			columnName: 'is_deleted',
			defaultsTo: false
		}
	},
	
	revokePrevious : function (previousPick, cb) {
		
		var sql = ' UPDATE pick SET is_deleted = true '
				+ ' WHERE team = \'' + previousPick.team + '\''
				+ ' AND round = ' + previousPick.round
				+ ' AND draft_no = ' + previousPick.draftNo
				+ ' AND is_deleted = false';
				
		sails.log.debug('撤銷前一次投單, sql=', sql);
		
		Pick.query(sql, function(err, results) {
			cb(err, results);
		});
	}
};

