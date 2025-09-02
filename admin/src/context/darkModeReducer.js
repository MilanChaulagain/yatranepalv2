const DarkModeReducer = (state, action) => {
  switch (action.type) {
    case "LIGHT": {
      return {
        ...state,
        darkMode: false,
      };
    }
    case "DARK": {
      return {
        ...state,
        darkMode: true,
      };
    }
    case "TOGGLE": {
      return {
        ...state,
        darkMode: !state.darkMode,
      };
    }
    case "SIDEBAR_TOGGLE": {
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed,
      };
    }
    case "SIDEBAR_OPEN": {
      return {
        ...state,
        sidebarCollapsed: false,
      };
    }
    case "SIDEBAR_CLOSE": {
      return {
        ...state,
        sidebarCollapsed: true,
      };
    }
    default:
      return state;
  }
};

export default DarkModeReducer;