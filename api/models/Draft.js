/* global Draft */
/* global sails */
/**
* Draft.js
*
* @description :: 模擬選秀的資訊
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {
		no: {
			type : 'integer',
			primaryKey: true,
			autoIncrement: true,
		},

		/* 官方選秀的編號 */
		officialDraftNo: {
			type : 'integer',
			required: true,
			columnName: 'official_draft_no'
		},
		
		/* 是公測中，非正式的模擬選秀 */
		isFake: {
			type: 'boolean',
			columnName: 'is_fake'
		}
	},
  
	beforeCreate: function(values, cb) {
		values.isFake = (sails.config.environment === 'development');
		cb();
	},

	/* 依官方選秀資訊建立一個模擬選秀 */
	createByOfficialDraft: function(officialDraft, cb){
		Draft.create({officialDraftNo : officialDraft.no})
		.exec(function(err, draft) {
			cb(err, draft);
		});
	},
	
	/* 最新一筆模擬選秀資訊 */
	findLatest: function(cb) {
		var isFake = (sails.config.environment === 'development');
	
		Draft.find({
			sort: {
				officialDraftNo: 0,
				no: 0
			}
		})
		.limit(1)
		.where({isFake: isFake})
		.exec(function(err, drafts) {
			cb(err, drafts[0] || null);
		});
		
	},
};

