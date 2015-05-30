/**
* Candidate.js
*
* @description :: 候選人
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
	no: {
		type : 'integer',
		unique : true,
		primaryKey: true,
		required: true,
		autoIncrement: true
	},

	/* 球員名字	*/
	name: {
		type : 'string',
		required: true
	},
	
	/* 官方選秀編號 */
	officialDraftNo: {
		type : 'integer',
		required: true,
		columnName: 'official_draft_no'
	},
  }
};

