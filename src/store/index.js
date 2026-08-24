import { configureStore } from '@reduxjs/toolkit';
import modalReducer from './slices/modalSlice';
import employeeFiltersReducer from './slices/filters/employeeFilterSlice';
import clientFiltersReducer from './slices/filters/clientFilterSlice';
import b2bFiltersReducer from './slices/filters/b2bFilterSlice';
import usersFiltersReducer from './slices/filters/usersFilterSlice';
import turkishAirlinesFiltersReducer from './slices/filters/turkishAirlinesFilterSlice';
import referralLetterFiltersReducer from './slices/filters/referralLetterFilterSlice';
import visaFiltersReducer from './slices/filters/visaFilterSlice';
import translateFiltersReducer from './slices/filters/translateFilterSlice';
import outboundFiltersReducer from './slices/filters/outboundFilterSlice';
import visaIntakeFiltersReducer from './slices/filters/visaIntakeFilterSlice';
import taskFiltersReducer from './slices/filters/taskFilterSlice';
import cafeteriaFiltersReducer from './slices/filters/cafeteriaFilterSlice';
import notificationsReducer from './slices/notificationSlice';

const store = configureStore({
  reducer: {
    modal:           modalReducer,
    notifications:   notificationsReducer,
    employeeFilters: employeeFiltersReducer,
    clientFilters: clientFiltersReducer,
    b2bFilters:      b2bFiltersReducer,
    usersFilters:    usersFiltersReducer,
    turkishAirlinesFilters: turkishAirlinesFiltersReducer,
    referralLetterFilters: referralLetterFiltersReducer,
    // ticketFilters:  ticketFiltersReducer,
    visaFilters:    visaFiltersReducer,
    translateFilters: translateFiltersReducer,
    outboundFilters: outboundFiltersReducer,
    visaIntakeFilters: visaIntakeFiltersReducer,
    taskFilters:     taskFiltersReducer,
    cafeteriaFilters: cafeteriaFiltersReducer,
    // paymentFilters: paymentFiltersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'modal/openModal',
          'modal/openAddClientModal',
        ],
        ignoredActionPaths: [
          'payload.onCreated',
          'payload.modalProps.onConfirm',
          'payload.modalProps.onCancel',
          'payload.modalProps.onClose',
          'payload.modalProps.children',
          'payload.modalProps.tabs',
          'payload.modalProps.footerButtons',
        ],
        ignoredPaths: [
          'modal.modalProps.onConfirm',
          'modal.modalProps.onCancel',
          'modal.modalProps.onClose',
          'modal.modalProps.children',
          'modal.modalProps.tabs',
          'modal.modalProps.footerButtons',
          'modal.addClient.onCreated',
        ],
      },
    }),
});

export default store;
