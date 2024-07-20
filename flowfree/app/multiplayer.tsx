"use client"
import {useEffect, useState} from "react"
import axios from 'axios'

export default function Multiplayer() {
    const [msg, setMsg] = useState('')
    useEffect(() => {
        axios.get("http://localhost:3004").then((response) => {
            console.log(response)
            if (response.data) {
                setMsg(response.data)
            }
        })
    })
    return (
        <>
        <div>{msg}</div>
        </>
    )
}