function Auth() {}
Auth.prototype = {
	constructor: Auth,
	data: { 
		roles: [],
		groups: {
		 'OWNERS': ['Owner'],
		 'MANAGERS': ['Manager']
		}
	},
	setEmployeeRoles: function( roles ){
		var _ = this;
		console.log(['roles', roles]);
		_.data.roles = roles;
	},
	isAuthorized: function( authorizedRoles ){
		var _ = this;
		return Utils.hasMatch( _.data.roles, authorizedRoles );
	},
	inAuthorizedGroup: function( groupName ){
		var _ = this;
		var authorizedRoles = _.data.groups[ groupName ];
		console.log(['inAuthorizedGroup', groupName, authorizedRoles, _.data.roles]);
		
		return Utils.hasMatch( _.data.roles, authorizedRoles );
	}
};
var Auth = new Auth();
