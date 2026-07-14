import { configureStore } from '@reduxjs/toolkit';
import modalReducer from './slices/modalSlice';
import employeeFiltersReducer from './slices/filters/employeeFilterSlice';
import clientFiltersReducer from './slices/filters/clientFilterSlice';
import b2bFiltersReducer from './slices/filters/b2bFilterSlice';
import usersFiltersReducer from './slices/filters/usersFilterSlice';
import turkishAirlinesFiltersReducer from './slices/filters/turkishAirlinesFilterSlice';

const store = configureStore({
  reducer: {
    modal:           modalReducer,
    employeeFilters: employeeFiltersReducer,
    clientFilters: clientFiltersReducer,
    b2bFilters:      b2bFiltersReducer,
    usersFilters:    usersFiltersReducer,
    turkishAirlinesFilters: turkishAirlinesFiltersReducer,
    // ticketFilters:  ticketFiltersReducer,
    // visaFilters:    visaFiltersReducer,
    // paymentFilters: paymentFiltersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore callback functions and ReactNode children in serializability checks
        ignoredActions: ['modal/openModal'],
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
