// Set options as a parameter, environment variable, or rc file.
// eslint-disable-next-line no-global-assign
require = require("esm")(module/* , options */)
module.exports = require("./server/server")

const users = loadUsers();


function loadUsers() {
	return JSON.parse(fs.readFileSync('server/data/users.json'));
}
function saveUsers(users) {
	fs.writeFileSync('server/data/users.json', JSON.stringify(users));
}