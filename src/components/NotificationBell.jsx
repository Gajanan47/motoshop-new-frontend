import  {useState, useEffect} from 'react'
import {
  fetchUserNotifications,
  fetchAdminNotifications,
  markUserNotificationRead,
  markAdminNotificationRead,
  clearUserNotifications,
  clearAdminNotifications,
} from '../api/notifications'


export default function NotificationBell  ({role})  {
    const [open, setopen] = useState(false)
    const [notifications, setnotifications] = useState([])
    const [unreadCount, setunreadCount] = useState(0)

    async function loadNotifications(){
      try{
          const response = role === "admin" ?
           await fetchAdminNotifications() :
            await fetchUserNotifications()

            setnotifications(response.data.data || [])
            setunreadCount(response.data.unreadCount || 0)

      }catch(err){
          console.error("Unable to load notifications", err)
      }
    }

    useEffect(() => {
      loadNotifications()
      const interval = setInterval(loadNotifications, 30000);

      return () => {
        clearInterval(interval)
      }
    }, [role])

    async function handleNotificationClick(notification) {
      if (notification.is_read) return

      // update immediately so the UI feels responsive
      setnotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: 1 } : n))
      )
      setunreadCount((prev) => Math.max(0, prev - 1))

      try {
        if (role === "admin") {
          await markAdminNotificationRead(notification.id)
        } else {
          await markUserNotificationRead(notification.id)
        }
      } catch (err) {
        console.error("Unable to mark notification as read", err)
        loadNotifications() // resync with server if the update failed
      }
    }

    async function handleClearAll() {
      const previous = notifications
      setnotifications([])
      setunreadCount(0)

      try {
        if (role === "admin") {
          await clearAdminNotifications()
        } else {
          await clearUserNotifications()
        }
      } catch (err) {
        console.error("Unable to clear notifications", err)
        setnotifications(previous) // restore on failure
      }
    }

  return (
    <div className='relative'>
        <button className='relative border border-slate-200 rounded-md px-3 py-1.5 hover:border-blue-500 focus:ring-2 focus:ring-blue-500 '
         onClick={()=>setopen(!open)}>
            🔔
            {unreadCount>0 &&
             (
                <span className='absolute -top-2 -right-2 bg-blue-400 text-white text-xs rounded-full px-1.5'>
                    {unreadCount}
                </span>
             )
            }
        </button>
        {
            open && (
                <div className='absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto'>
                    <div className='flex items-center justify-between bg-blue-200 p-3 border-b'>
                        <h3 className='font-semibold'>Notifications</h3>
                        {notifications.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className='text-xs text-slate-600 hover:text-blue-600 underline cursor-pointer'
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                    {notifications.length === 0 ? (

                            <span className='block text-center p-4 text-sm text-slate-500'>No notifications yet</span>

                    ) :
                    notifications.map((notification) => (
                        <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-3 border-b cursor-pointer transition ${
                          notification.is_read ? 'bg-white' : 'bg-blue-50 hover:bg-blue-100'
                        }`}
                        >
                            <div className='flex items-start gap-2'>
                              {!notification.is_read && (
                                <span className='mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0'></span>
                              )}
                              <div>
                                <p className='font-medium text-sm'>{notification.title}</p>
                                <p className='text-sm text-slate-600'>{notification.message}</p>
                              </div>
                            </div>
                        </div>

                    ))
                }
                </div>
            )
        }
    </div>
  )
}