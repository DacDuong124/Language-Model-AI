// Subscription.js
import React, { useEffect, useState, useMemo } from 'react';
import '../App.css'
import { getAuth } from 'firebase/auth';
import moment from 'moment';
import { useTable, useSortBy } from 'react-table';


// import { Link, Outlet } from 'react-router-dom';

const ManageAccount = () => {
  const [users, setUsers] = useState([]);

  // Function to fetch the user list
  const fetchUserList = (idToken) => {
    fetch('/list-users', {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
      }
      return response.json();
    })
    .then(data => setUsers(data))
    .catch(error => console.error('Error fetching users:', error));
  };

  useEffect(() => {
    const auth = getAuth();
  
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        user.getIdToken(true).then(idToken => {
          fetchUserList(idToken);
        });
      }
    });
  
    return () => unsubscribe();
  }, []);
  
  const formatDate = (timestamp) => {
    if (!timestamp) return ''; // If there's no timestamp, return an empty string or some default text
    return moment(timestamp).format('DD/MM/YYYY - HH:mm:ss');
  };

  const data = useMemo(() => users.map(user => ({
    ...user,
    createdDate: formatDate(user.created), // Make sure createdAt matches the property name for the creation date
    lastSignInDate: formatDate(user.last_sign_in), // Similarly, lastSignInAt should match the property for the last sign-in date
  })), [users]);

  const columns = useMemo(() => [
    {
      Header: 'Identifier',
      accessor: 'email',
    },
    {
      Header: 'Providers',
      accessor: 'provider', // update this to the correct accessor
    },
    {
      Header: 'Created',
      accessor: 'createdDate',
    },
    {
      Header: 'Last Signed In',
      accessor: 'lastSignInDate',
    },
    {
      Header: 'User UID',
      accessor: 'uid',
    },
  ], []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data }, useSortBy);

  return (

    // <div className='adminManageAccountBackground'>
    //   <h1>Manage User Accounts</h1>
    //   <h1>User List</h1>
    //   {/* <ul>
    //     {users.map(user => (
    //       <li key={user.uid}>{user.email}</li> // Display user details as required
    //     ))}
    //   </ul> */}
    //   <table>
    //     <thead>
    //       <tr>
    //         <th>Identifier</th>
    //         <th>Providers</th>
    //         <th>Created</th>
    //         <th>Last Signed In</th>
    //         <th>User UID</th>

    //         {/* ... other headers */}
    //       </tr>
    //     </thead>
    //     <tbody>
    //       {users.map((user, index) => (
    //         <tr key={index}>
    //           <td>{user.email}</td>
    //           <td>{user.provider}</td>
    //           <td>{formatDate(user.created)}</td>
    //           <td>{formatDate(user.last_sign_in)}</td>
    //           <td>{user.uid}</td>

    //           {/* ... other user details */}
    //         </tr>
    //       ))}
    //     </tbody>
    //   </table>
    // </div>

    <div className='adminManageAccountBackground'>
      <h1>Manage User Accounts</h1>
      {/* React-table structure */}
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render('Header')}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? ' 🔽'
                        : ' 🔼'
                      : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ManageAccount;