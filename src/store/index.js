import { configureStore } from '@reduxjs/toolkit';
import modalReducer from './slices/modalSlice';

const store = configureStore({
  reducer: {
    modal: modalReducer,
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
