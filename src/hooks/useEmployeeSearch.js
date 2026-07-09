import { useState, useMemo } from 'react';

export const MOCK_EMPLOYEES = [
  { id: '1',  fullName: 'Ahmet Yılmaz',       phoneNumber: '+993 61 123456', gmail: 'ahmet.yilmaz@oguztravel.com',       department: 'Engineering',  position: 'Software Engineer',      office: 'Ashgabat' },
  { id: '2',  fullName: 'Fatma Demir',         phoneNumber: '+993 62 234567', gmail: 'fatma.demir@oguztravel.com',        department: 'Management',   position: 'Project Manager',        office: 'Istanbul' },
  { id: '3',  fullName: 'Mehmet Kaya',         phoneNumber: '+993 63 345678', gmail: 'mehmet.kaya@oguztravel.com',        department: 'Sales',        position: 'Sales Director',         office: 'Ankara' },
  { id: '4',  fullName: 'Ayşe Çelik',          phoneNumber: '+993 64 456789', gmail: 'ayse.celik@oguztravel.com',         department: 'HR',           position: 'HR Specialist',          office: 'Ashgabat' },
  { id: '5',  fullName: 'Ali Şahin',           phoneNumber: '+993 65 567890', gmail: 'ali.sahin@oguztravel.com',          department: 'Finance',      position: 'Accountant',             office: 'Istanbul' },
  { id: '6',  fullName: 'Zeynep Arslan',       phoneNumber: '+993 71 678901', gmail: 'zeynep.arslan@oguztravel.com',      department: 'Marketing',    position: 'Marketing Specialist',   office: 'Ankara' },
  { id: '7',  fullName: 'Emre Koç',            phoneNumber: '+993 61 789012', gmail: 'emre.koc@oguztravel.com',           department: 'IT',           position: 'System Administrator',   office: 'Ashgabat' },
  { id: '8',  fullName: 'Selin Yıldız',        phoneNumber: '+993 62 890123', gmail: 'selin.yildiz@oguztravel.com',       department: 'Engineering',  position: 'Frontend Developer',     office: 'Istanbul' },
  { id: '9',  fullName: 'Burak Özdemir',       phoneNumber: '+993 63 901234', gmail: 'burak.ozdemir@oguztravel.com',      department: 'Sales',        position: 'Sales Representative',   office: 'Ankara' },
  { id: '10', fullName: 'Merve Doğan',         phoneNumber: '+993 64 012345', gmail: 'merve.dogan@oguztravel.com',        department: 'HR',           position: 'Recruiter',              office: 'Ashgabat' },
  { id: '11', fullName: 'Can Polat',           phoneNumber: '+993 65 112233', gmail: 'can.polat@oguztravel.com',          department: 'Finance',      position: 'Financial Analyst',      office: 'Istanbul' },
  { id: '12', fullName: 'Elif Aydın',          phoneNumber: '+993 71 223344', gmail: 'elif.aydin@oguztravel.com',         department: 'Marketing',    position: 'Content Manager',        office: 'Ankara' },
  { id: '13', fullName: 'Murat Çetin',         phoneNumber: '+993 61 334455', gmail: 'murat.cetin@oguztravel.com',        department: 'IT',           position: 'DevOps Engineer',        office: 'Ashgabat' },
  { id: '14', fullName: 'Derya Güneş',         phoneNumber: '+993 62 445566', gmail: 'derya.gunes@oguztravel.com',        department: 'Engineering',  position: 'Backend Developer',      office: 'Istanbul' },
  { id: '15', fullName: 'Serkan Taş',          phoneNumber: '+993 63 556677', gmail: 'serkan.tas@oguztravel.com',         department: 'Management',   position: 'Product Owner',          office: 'Ankara' },
  { id: '16', fullName: 'Hülya Korkmaz',       phoneNumber: '+993 64 667788', gmail: 'hulya.korkmaz@oguztravel.com',      department: 'HR',           position: 'HR Manager',             office: 'Ashgabat' },
  { id: '17', fullName: 'Tolga Erdem',         phoneNumber: '+993 65 778899', gmail: 'tolga.erdem@oguztravel.com',        department: 'Finance',      position: 'Budget Analyst',         office: 'Istanbul' },
  { id: '18', fullName: 'Neslihan Yılmaz',     phoneNumber: '+993 71 889900', gmail: 'neslihan.yilmaz@oguztravel.com',   department: 'Marketing',    position: 'Brand Manager',          office: 'Ankara' },
  { id: '19', fullName: 'Kerem Aktaş',         phoneNumber: '+993 61 990011', gmail: 'kerem.aktas@oguztravel.com',        department: 'IT',           position: 'Network Engineer',       office: 'Ashgabat' },
  { id: '20', fullName: 'Pınar Uçar',          phoneNumber: '+993 62 001122', gmail: 'pinar.ucar@oguztravel.com',         department: 'Engineering',  position: 'QA Engineer',            office: 'Istanbul' },
  { id: '21', fullName: 'Gökhan Kılıç',        phoneNumber: '+993 63 111222', gmail: 'gokhan.kilic@oguztravel.com',       department: 'Sales',        position: 'Account Manager',        office: 'Ankara' },
  { id: '22', fullName: 'Tuğba Öztürk',        phoneNumber: '+993 64 222333', gmail: 'tugba.ozturk@oguztravel.com',       department: 'HR',           position: 'Training Specialist',    office: 'Ashgabat' },
  { id: '23', fullName: 'Onur Şimşek',         phoneNumber: '+993 65 333444', gmail: 'onur.simsek@oguztravel.com',        department: 'Finance',      position: 'Tax Consultant',         office: 'Istanbul' },
  { id: '24', fullName: 'Ceren Aslan',         phoneNumber: '+993 71 444555', gmail: 'ceren.aslan@oguztravel.com',        department: 'Marketing',    position: 'Social Media Manager',   office: 'Ankara' },
  { id: '25', fullName: 'Berk Toprak',         phoneNumber: '+993 61 555666', gmail: 'berk.toprak@oguztravel.com',        department: 'IT',           position: 'Security Engineer',      office: 'Ashgabat' },
  { id: '26', fullName: 'Şeyma Güler',         phoneNumber: '+993 62 666777', gmail: 'seyma.guler@oguztravel.com',        department: 'Engineering',  position: 'Mobile Developer',       office: 'Istanbul' },
  { id: '27', fullName: 'Arda Bulut',          phoneNumber: '+993 63 777888', gmail: 'arda.bulut@oguztravel.com',         department: 'Management',   position: 'Scrum Master',           office: 'Ankara' },
  { id: '28', fullName: 'Melek Kaplan',        phoneNumber: '+993 64 888999', gmail: 'melek.kaplan@oguztravel.com',       department: 'HR',           position: 'Payroll Specialist',     office: 'Ashgabat' },
  { id: '29', fullName: 'Furkan Yalçın',       phoneNumber: '+993 65 999000', gmail: 'furkan.yalcin@oguztravel.com',      department: 'Finance',      position: 'Controller',             office: 'Istanbul' },
  { id: '30', fullName: 'Ece Kara',            phoneNumber: '+993 71 100200', gmail: 'ece.kara@oguztravel.com',           department: 'Marketing',    position: 'SEO Specialist',         office: 'Ankara' },
  { id: '31', fullName: 'Volkan Erdoğan',      phoneNumber: '+993 61 200300', gmail: 'volkan.erdogan@oguztravel.com',     department: 'IT',           position: 'Cloud Architect',        office: 'Ashgabat' },
  { id: '32', fullName: 'Büşra Karadeniz',     phoneNumber: '+993 62 300400', gmail: 'busra.karadeniz@oguztravel.com',   department: 'Engineering',  position: 'Data Scientist',         office: 'Istanbul' },
  { id: '33', fullName: 'Ozan Acar',           phoneNumber: '+993 63 400500', gmail: 'ozan.acar@oguztravel.com',          department: 'Sales',        position: 'Business Developer',     office: 'Ankara' },
  { id: '34', fullName: 'İpek Durmaz',         phoneNumber: '+993 64 500600', gmail: 'ipek.durmaz@oguztravel.com',        department: 'HR',           position: 'Employee Relations',     office: 'Ashgabat' },
  { id: '35', fullName: 'Serhat Koçak',        phoneNumber: '+993 65 600700', gmail: 'serhat.kocak@oguztravel.com',       department: 'Finance',      position: 'Risk Analyst',           office: 'Istanbul' },
  { id: '36', fullName: 'Aylin Özkan',         phoneNumber: '+993 71 700800', gmail: 'aylin.ozkan@oguztravel.com',        department: 'Marketing',    position: 'Campaign Manager',       office: 'Ankara' },
  { id: '37', fullName: 'Ufuk Demirci',        phoneNumber: '+993 61 800900', gmail: 'ufuk.demirci@oguztravel.com',       department: 'IT',           position: 'Database Admin',         office: 'Ashgabat' },
  { id: '38', fullName: 'Gamze Yıldırım',      phoneNumber: '+993 62 901001', gmail: 'gamze.yildirim@oguztravel.com',    department: 'Engineering',  position: 'Full Stack Developer',   office: 'Istanbul' },
  { id: '39', fullName: 'Tarık Özbek',         phoneNumber: '+993 63 002002', gmail: 'tarik.ozbek@oguztravel.com',        department: 'Management',   position: 'CTO',                    office: 'Ankara' },
  { id: '40', fullName: 'Özlem Başaran',       phoneNumber: '+993 64 103103', gmail: 'ozlem.basaran@oguztravel.com',      department: 'HR',           position: 'Talent Acquisition',     office: 'Ashgabat' },
  { id: '41', fullName: 'Alp Çakır',           phoneNumber: '+993 65 204204', gmail: 'alp.cakir@oguztravel.com',          department: 'Finance',      position: 'CFO',                    office: 'Istanbul' },
  { id: '42', fullName: 'Deniz Uysal',         phoneNumber: '+993 71 305305', gmail: 'deniz.uysal@oguztravel.com',        department: 'Marketing',    position: 'Growth Hacker',          office: 'Ankara' },
  { id: '43', fullName: 'Kaan Özgür',          phoneNumber: '+993 61 406406', gmail: 'kaan.ozgur@oguztravel.com',         department: 'IT',           position: 'AI Engineer',            office: 'Ashgabat' },
  { id: '44', fullName: 'Simge Avcı',          phoneNumber: '+993 62 507507', gmail: 'simge.avci@oguztravel.com',         department: 'Engineering',  position: 'Embedded Engineer',      office: 'Istanbul' },
  { id: '45', fullName: 'Hasan Karayel',       phoneNumber: '+993 63 608608', gmail: 'hasan.karayel@oguztravel.com',      department: 'Sales',        position: 'Regional Manager',       office: 'Ankara' },
  { id: '46', fullName: 'Filiz Bayram',        phoneNumber: '+993 64 709709', gmail: 'filiz.bayram@oguztravel.com',       department: 'HR',           position: 'Benefits Coordinator',   office: 'Ashgabat' },
  { id: '47', fullName: 'Erkan Duman',         phoneNumber: '+993 65 810810', gmail: 'erkan.duman@oguztravel.com',        department: 'Finance',      position: 'Audit Manager',          office: 'Istanbul' },
  { id: '48', fullName: 'Bahar Gürbüz',        phoneNumber: '+993 71 911911', gmail: 'bahar.gurbuz@oguztravel.com',       department: 'Marketing',    position: 'PR Specialist',          office: 'Ankara' },
  { id: '49', fullName: 'Selim Ateş',          phoneNumber: '+993 61 012012', gmail: 'selim.ates@oguztravel.com',         department: 'IT',           position: 'UI/UX Designer',         office: 'Ashgabat' },
  { id: '50', fullName: 'Yasemin Topçu',       phoneNumber: '+993 62 113113', gmail: 'yasemin.topcu@oguztravel.com',      department: 'Engineering',  position: 'Tech Lead',              office: 'Istanbul' },
];

export const useEmployeeSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const data = useMemo(() => {
    return MOCK_EMPLOYEES.filter((emp) =>
      Object.values(emp).some((val) =>
        String(val).toLowerCase().includes()
      )
    );
  }, []);

  return {
    data,
    isLoading: false, 
    searchQuery,
    setSearchQuery,
  };
};
