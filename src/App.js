import React, { useState, useEffect } from 'react'
import { Route, Switch, Redirect } from "react-router-dom";

import AuthLayout from "layouts/Auth.js";
import AdminLayout from "layouts/Admin.js";
import RTLLayout from "layouts/RTL.js"; // Chakra imports

import { MyGlobalContext } from 'utils/context';
import { getUser } from 'utils/utilites';
import { useHistory } from 'react-router-dom';
import supabaseClient from 'utils/supabaseClient';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const history = useHistory();

  useEffect(() => { 
    getUser().then(({data}) => { 
      console.log(user)
      console.log(data.user);
      setUser(data.user);
      setLoading(false);
      if(!data.user) {
        history.push('/auth/signin')
      }
    });
  }, [])
  
  useEffect(() => { 
    supabaseClient.auth.onAuthStateChange((event) => { 
        console.log(event)
        if(event === 'SIGNED_OUT') {
            window.location.reload();
        }
    })
  }, [])

  if(loading === true) {
    return null;
  }else {
    return (
      <MyGlobalContext.Provider value={{ user, setUser }}>
          <Switch>
              <Route path={`/auth`} component={AuthLayout} />
              <Route path={`/admin`} component={AdminLayout} />
              <Route path={`/rtl`} component={RTLLayout} />
              <Redirect from={`/`} to={"/admin/dashboard"} />
          </Switch>
      </MyGlobalContext.Provider>
    )
  }
}

export default App;
