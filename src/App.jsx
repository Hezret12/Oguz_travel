import './App.css';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import routes from './routes/index';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import GlobalModal from './components/GlobalModal';
import AddClientModal from './components/global/AddClientModal/AddClientModal';

import dayjs from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import 'dayjs/locale/tr';

dayjs.extend(updateLocale);

dayjs.updateLocale('tr', {
  weekdays: ['Ýekşenbe', 'Duşenbe', 'Sişenbe', 'Çarşenbe', 'Penşenbe', 'Anna', 'Şenbe'],
  weekdaysShort: ['Ýe', 'Du', 'Şi', 'Ça', 'Pe', 'An', 'Şe'],
  weekdaysMin: ['Ýe', 'Du', 'Şi', 'Ça', 'Pe', 'An', 'Şe'],
  months: [
    'Ýanwar',
    'Fewral',
    'Mart',
    'Aprel',
    'Mai',
    'Iýun',
    'Iýul',
    'Awgust',
    'Sentýabr',
    'Oktýabr',
    'Noýabr',
    'Dekabr',
  ],
  monthsShort: ['Ýan', 'Few', 'Mar', 'Apr', 'Mai', 'Iýn', 'Iýl', 'Awg', 'Sen', 'Okt', 'Noý', 'Dek'],
  weekStart: 1,
});

dayjs.locale('tr');

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
      <RouterProvider router={routes} />
      <GlobalModal />
      <AddClientModal />
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
    </LocalizationProvider>
  );
}

export default App;
