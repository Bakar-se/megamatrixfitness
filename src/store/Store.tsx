import { combineReducers, configureStore } from '@reduxjs/toolkit';
import clientsReducer from './ClientsSlice';
import subscriptionsReducer from './SubscriptionSlice';
import gymsReducer from './GymsSlice';
import membersReducer from './MemberSlice';
import equipmentReducer from './EquipmentSlice';
import {
  useDispatch as useAppDispatch,
  useSelector as useAppSelector,
  TypedUseSelectorHook
} from 'react-redux';

export const store = configureStore({
  reducer: {
    clients: clientsReducer,
    subscriptions: subscriptionsReducer,
    gyms: gymsReducer,
    members: membersReducer,
    equipment: equipmentReducer
  }
});

const rootReducer = combineReducers({
  clients: clientsReducer,
  subscriptions: subscriptionsReducer,
  gyms: gymsReducer,
  members: membersReducer,
  equipment: equipmentReducer
});

export type AppState = ReturnType<typeof rootReducer>;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export const { dispatch } = store;
export const useDispatch = () => useAppDispatch<AppDispatch>();
export const useSelector: TypedUseSelectorHook<AppState> = useAppSelector;

export default store;
