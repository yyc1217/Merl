/* global OfficialDraft */
/**
* OfficialDraft.js
*
* @description :: 官方選秀資訊
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {
		no: {
			type : 'integer',
			primaryKey: true,
			autoIncrement: true
		},

		/* 選秀舉行日 */
		hostDate: {
			type : 'datetime',
			required: true,
			columnName: 'host_date'
		},
		
		name : {
			type : 'string',
			required : true
		}
	},
  
	/**
		找出最新一筆
	*/
	findLatestOne: function(cb) {
		OfficialDraft.find().limit(1).sort('hostDate DESC')
		.exec(function(err, latestOfficialDraft){
			cb(err, latestOfficialDraft[0]);
		});	
	}
		
};

