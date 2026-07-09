import { createSlice } from '@reduxjs/toolkit';

const initialAddClientState = {
  open: false,
  initialValues: {},
  onCreated: null,
};

const initialState = {
  isOpen: false,
  modalType: null,
  modalProps: {},
  addClient: initialAddClientState,
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal: (state, action) => {
      state.isOpen = true;
      state.modalType = action.payload.modalType;
      state.modalProps = action.payload.modalProps || {};
    },
    closeModal: (state) => {
      state.isOpen = false;
      state.modalType = null;
      state.modalProps = {};
    },
    openAddClientModal: (state, action) => {
      state.addClient = {
        open: true,
        initialValues: action.payload?.initialValues || {},
        onCreated: action.payload?.onCreated || null,
      };
    },
    closeAddClientModal: (state) => {
      state.addClient = initialAddClientState;
    },
  },
});

export const { openModal, closeModal, openAddClientModal, closeAddClientModal } = modalSlice.actions;
export const selectModal = (state) => state.modal;
export const selectAddClientModal = (state) => state.modal.addClient;
export default modalSlice.reducer;
