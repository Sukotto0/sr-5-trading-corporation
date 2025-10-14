import { UserProfile } from '@clerk/nextjs'
import React from 'react'

const AdminProfile = () => {
  return (
    <div className='flex w-full h-full min-h-vh items-center justify-center'>
        <UserProfile />
    </div>
  )
}

export default AdminProfile