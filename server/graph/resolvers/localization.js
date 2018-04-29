const graphHelper = require('../../helpers/graph')
const _ = require('lodash')

/* global WIKI */

module.exports = {
  Query: {
    async localization() { return {} }
  },
  Mutation: {
    async localization() { return {} }
  },
  LocalizationQuery: {
    async locales(obj, args, context, info) {
      let remoteLocales = await WIKI.redis.get('locales')
      let localLocales = await WIKI.db.Locale.findAll({
        attributes: {
          exclude: ['strings']
        },
        raw: true
      })
      remoteLocales = (remoteLocales) ? JSON.parse(remoteLocales) : localLocales
      return _.map(remoteLocales, rl => {
        let isInstalled = _.some(localLocales, ['code', rl.code])
        return {
          ...rl,
          isInstalled,
          installDate: isInstalled ? _.find(localLocales, ['code', rl.code]).updatedAt : null
        }
      })
    }
  },
  LocalizationMutation: {
    async updateLocale(obj, args, context) {
      try {
        let authResult = await WIKI.db.User.login(args, context)
        return {
          ...authResult,
          responseResult: graphHelper.generateSuccess('Login success')
        }
      } catch (err) {
        return graphHelper.generateError(err)
      }
    }
  }
}
