/*
	Storage Object Structure
	{
		programId: {
					//key: date
					'YYYY-MM-DD': {	
									//keys 
					 				awaitingCheckins: { //key
					 									studentId: { 
					 												checkinModel ( studentId, checkinTime ) 
					 												}
					 								   },
					 				processingCheckins: {},
					 				awaitingCheckouts: {},
					 				processingCheckouts: {}
								  }
				   }
	}
*/
var appLocalStorage = window.localStorage;
var _checkinLocalStorage = {
	_setProgramStorage: function( programId, programStorage ){
		appLocalStorage.setItem(programId, JSON.stringify(programStorage) );
	},
	setProcessingCheckin: function( programId, studentId, checkinModel, _moment ){
		_moment = _moment || moment();
		var dateKey = _moment.format('YYYY-MM-DD');
		_checkinLocalStorage.removeAwaitingCheckin( programId, studentId, dateKey );
		var programStorage = _checkinLocalStorage.getProgramDateStorage( programId, dateKey );
		programStorage[dateKey].processingCheckins[studentId] = checkinModel;
		_checkinLocalStorage._setProgramStorage( programId, programStorage);
	},	
	setAwaitingCheckin: function( programId, studentId, checkinModel, _moment ){
		_moment = _moment || moment();
		var dateKey = _moment.format('YYYY-MM-DD');
		_checkinLocalStorage.removeProcessingCheckin( programId, studentId, dateKey );
		var programStorage = _checkinLocalStorage.getProgramDateStorage( programId, dateKey );
		programStorage[dateKey].awaitingCheckins[studentId] = checkinModel;
		_checkinLocalStorage._setProgramStorage( programId, programStorage);
	},
	getProcessingCheckin: function( programId, studentId, _moment ){
		_moment = _moment || moment();
		var awaitingCheckins = getAwaitingCheckins( programId, _moment );
		if( typeof awaitingCheckins[ studentId ] !== 'undefined' ){
			return awaitingCheckins[ studentId ];
		}
		return {};
	},
	getAwaitingCheckins: function( programId, _moment ){
		_moment = _moment || moment();
		var dateKey = _moment.format('YYYY-MM-DD');
		var programStorage = _checkinLocalStorage.getProgramStorage( programId );
		if( typeof programStorage[dateKey] !== 'undefined' &&
			typeof programStorage[dateKey].awaitingCheckins !== 'undefined'
		){
			return programStorage[dateKey].awaitingCheckins;
		}
		return {};
	},
	getAwaitingCheckinsList: function( programId, _moment ){
		_moment = _moment || moment();
		var dateKey = _moment.format('YYYY-MM-DD');
		var programStorage = _checkinLocalStorage.getProgramStorage( programId );
		if( typeof programStorage[dateKey] !== 'undefined' &&
			typeof programStorage[dateKey].awaitingCheckins !== 'undefined'
		){
			return _checkinLocalStorage.getCheckinModelList( programStorage[dateKey].awaitingCheckins );
		}
		return [];
	},
	getProgramStorage: function( programId ){
		var programStorage = JSON.parse( appLocalStorage.getItem(programId) );
		if( typeof programStorage === 'undefined' || programStorage === null ){
			programStorage = {};
			_checkinLocalStorage._setProgramStorage( programId, programStorage);
		}
		return programStorage;
	},
	getProgramDateStorage: function( programId, dateKey ){
		var programStorage = _checkinLocalStorage.getProgramStorage( programId );
		if( typeof programStorage[dateKey] === 'undefined' ||  programStorage[dateKey] === null ){
			programStorage[dateKey] = {
					awaitingCheckins: {},
					processingCheckins: {},
					awaitingCheckouts: {},
					processingCheckouts: {}
			};
			_checkinLocalStorage._setProgramStorage( programId, programStorage);
		}
		return programStorage;
	},
	getCheckinModelList: function( checkinModelMap ){
		var checkinModelList = [], prop;
		for( prop in checkinModelMap ){
			if( checkinModelMap.hasOwnProperty( prop ) ){
				checkinModelList.push( checkinModelMap[prop] );
			}
		}
		return checkinModelList;
	},
	removeCheckin: function( programId, studentId, _moment){
		_moment = _moment || moment();
		var dateKey = _moment.format('YYYY-MM-DD');
		_checkinLocalStorage.removeProcessingCheckin( programId, studentId, dateKey );
		_checkinLocalStorage.removeAwaitingCheckin( programId, studentId, dateKey );
	},
	removeProcessingCheckin: function( programId, studentId, dateKey ){
		var programStorage = _checkinLocalStorage.getProgramStorage( programId );
		if( typeof programStorage[dateKey] !== 'undefined' &&
			typeof programStorage[dateKey].processingCheckins !== 'undefined' &&
			typeof programStorage[dateKey].processingCheckins[studentId] !== 'undefined'
		){
			delete programStorage[dateKey].processingCheckins[studentId];
		}
		_checkinLocalStorage._setProgramStorage( programId, programStorage );
	},
	removeAwaitingCheckin: function( programId, studentId, dateKey ){
		var programStorage = _checkinLocalStorage.getProgramStorage( programId );
		if( typeof programStorage[dateKey] !== 'undefined' &&
			typeof programStorage[dateKey].awaitingCheckins !== 'undefined' &&
			typeof programStorage[dateKey].awaitingCheckins[studentId] !== 'undefined'
		){
			delete programStorage[dateKey].awaitingCheckins[studentId];
		}
		_checkinLocalStorage._setProgramStorage( programId, programStorage );
	}
		
};