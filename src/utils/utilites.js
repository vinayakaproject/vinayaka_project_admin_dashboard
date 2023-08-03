import supabaseClient from "./supabaseClient";

export const getUser = async () => { 
    const user = await supabaseClient.auth.getUser();
    return user;
}

export const userFun = async (urlPath, body, method) => { 
    const BACKEND_URL = 'https://vinayaka-project-backend.onrender.com/api/admin/';
    const url = BACKEND_URL + urlPath;

    const headers = {
        "Content-Type": "application/json",
    };

    const otherDet = {
        method,
        headers: headers,
    }

    const res = body ? await fetch(url, {
        ...otherDet,
        body: JSON.stringify(body)
    }) : await fetch(url, {
        ...otherDet,
    });

    if(res) {
        console.log(res)
        const json = await res.json();  
        return { status: res.status, message: json.message };
    } else {
        return { status: 500, message: "Something went wrong" };
    }
}