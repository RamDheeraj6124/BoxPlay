const initialState = {
    selecteduser: null,
};

const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SELECT_User':
            return {
                ...state,
                selecteduser: action.payload,
            };
        default:
            return state;
    }
};

export default rootReducer;
