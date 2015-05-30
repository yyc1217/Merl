var moment = require('moment');
/**
 * Production environment settings
 *
 * This file can include shared settings for a production environment,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

   /**
    * TODO 應該是某個時間點才開始選秀才對
    */
   startDraftTime : function startDraftTime() {
      return moment().add(1200, 'seconds');
   }
};
