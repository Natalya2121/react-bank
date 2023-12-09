export enum REQUEST_ACTION_TYPE  {
  PROGRESS= "progress",
  SUCCESS= "success",
  ERROR= "error",
  RESET= "reset",
};

export type Action = {
  type: REQUEST_ACTION_TYPE;
};

export type State = {
  status: Action | null,
  message: string | null,
  data: object | null,
};

export const requestInitialState = {
  status: null,
  message: null,
  data: null,
};


// export const requestReducer =  (state: State, action: Action | PayloadAction<string | object | null>): State => {

export const requestReducer =  (state: State, action: any): State => {
  switch (action.type) {
    case REQUEST_ACTION_TYPE.PROGRESS:
      return {
        ...state,
        status: action.type,
        // message: null,
        // data: null,
      };

    case REQUEST_ACTION_TYPE.SUCCESS:
      return {
        ...state,
        status: action.type,
        data: action.payload,
      };

    case REQUEST_ACTION_TYPE.ERROR:
      return {
        ...state,
        status: action.type,
        message: action.payload,
      };

    case REQUEST_ACTION_TYPE.RESET:
      return {
        ...requestInitialState,
      };

    default:
      return { ...state };
  }
};
