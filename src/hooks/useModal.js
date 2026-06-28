import { useDispatch, useSelector } from 'react-redux';
import { openModal, closeModal, selectModal } from '../store/slices/modalSlice';

const useModal = () => {
  const dispatch = useDispatch();
  const modalState = useSelector(selectModal);

  const open = ({ modalType, modalProps = {} }) => {
    dispatch(openModal({ modalType, modalProps }));
  };

  const close = () => {
    dispatch(closeModal());
  };

  return {
    open,
    close,
    isOpen: modalState.isOpen,
    modalType: modalState.modalType,
    modalProps: modalState.modalProps,
  };
};

export default useModal;
