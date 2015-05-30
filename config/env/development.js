var moment = require('moment');

/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

	
  /***************************************************************************
   * Set the default database connection for models in the development       *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/
	/**
    * n秒後開始選秀流程
    */ 
   startDraftTime : function startDraftTime() {
      return moment().add(60, 'seconds');
   }
   //TODO 應該是某個時間點才開始選秀才對
};
