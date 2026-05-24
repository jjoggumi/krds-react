const { raw } = require("core-js/core/string");

const using_modules = [
  // 'Classrooms', 'Classroom', 'V2', 'Attendances', 'SendMessages', 'NotificationUserSettings', 'Clazzes', 'Hitalks', 
  'Timetables'
];

// const swagger_url = 'https://cbt2tapi.hiclass.net/v3/api-docs';
const swagger_url = 'http://localhost:19081/v3/api-docs';
const temp_path = './generated-apis';

const Capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);
const buildTailOfRoute = route => {
  const stripInvalidChars = str => str.replace(/[\{\}]/g, '').replace(/[-.]/g, '').replace('!q', '');
  const getValidWords = str => Capitalize(stripInvalidChars(str));

  const parts = route.split('/');
  const lastPart = parts.pop();
  return (/^\{.*\}$/.test(lastPart) ? getValidWords(parts.pop()) : '') + getValidWords(lastPart);
}


module.exports = {
  hooks: {
    onCreateRouteName: ({usage, original, duplicate}, rawRouteInfo) => {
      const tailOfRoute = buildTailOfRoute(rawRouteInfo.route);
      const transform = t => {
        const replaced = t.replace(/\d+/g, '');
        return replaced === tailOfRoute ? replaced : replaced + Capitalize(tailOfRoute);
      }
      return {
        usage: transform(usage),
        original: transform(original),
        duplicate
      };
    },
  },
  swagger_url,
  temp_path,
  swagger_json: `${temp_path}/api.json`,
  using_modules: [
    'data-contracts',
    'http-client',
    ...using_modules
  ]
};
