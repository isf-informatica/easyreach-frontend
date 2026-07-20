// frontend/src/api/commands.js
import api from './axios'

export const sendCommand = async (schoolId, commandType, payload = {}) => {
  const res = await api.post(`/easyreach/schools/${schoolId}/command`, {
    command_type: commandType,
    payload
  })
  return res.data
}

export const getCommandResult = async (commandId) => {
  const res = await api.get(`/easyreach/agent/command-result/${commandId}`)
  return res.data
}

export const pollCommandResult = async (commandId, onResult, maxAttempts = 10) => {
  let attempts = 0
  const interval = setInterval(async () => {
    attempts++
    try {
      const data = await getCommandResult(commandId)
      if (data.status === 'done') {
        clearInterval(interval)
        onResult({ success: true, result: data.result, executed_at: data.executed_at })
      }
    } catch (e) {
      // keep polling
    }
    if (attempts >= maxAttempts) {
      clearInterval(interval)
      onResult({ success: false, result: 'Timeout — agent did not respond in time' })
    }
  }, 5000) // check every 5 seconds
  return () => clearInterval(interval) // return cleanup fn
}