const token = import.meta.env.VITE_METAAPI_TOKEN

export const deployMT5Account = async (login, password, server) => {
  if (!token) throw new Error("MetaAPI token not configured in .env")
  
  // 0. Check if account already exists
  const listRes = await fetch('/metaapi/users/current/accounts', {
    headers: { 'auth-token': token }
  })
  if (listRes.ok) {
    const accounts = await listRes.json()
    const existing = accounts.find(a => a.login === login && a.server === server)
    if (existing) {
      return await startAndPollAccount(existing._id)
    }
  }

  // 1. Create Account via Provisioning API
  const createRes = await fetch('/metaapi/users/current/accounts', {
    method: 'POST',
    headers: {
      'auth-token': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: `MarketSim ${login}`,
      login,
      password,
      server,
      platform: 'mt5',
      type: 'cloud',
      magic: 1000
    })
  })
  
  if (!createRes.ok) {
    const text = await createRes.text()
    try {
      const errorData = JSON.parse(text)
      if (errorData.details) {
        const messages = errorData.details.map(d => `${d.parameter}: ${d.message}`).join(', ')
        throw new Error(`Validation failed: ${messages}`)
      }
      throw new Error(errorData.message || 'Failed to create MetaAPI account')
    } catch (e) {
      if (e.message.includes('Validation failed')) throw e
      throw new Error(`Server returned error ${createRes.status}: ${text || 'Empty response'}`)
    }
  }
  
  const account = await createRes.json()
  return await startAndPollAccount(account._id)
}

async function startAndPollAccount(accountId) {
  if (!accountId) throw new Error('Cannot deploy: accountId is undefined')
  
  // 2. Deploy Account
  const deployRes = await fetch(`/metaapi/users/current/accounts/${accountId}/deploy`, {
    method: 'POST',
    headers: { 'auth-token': token }
  })
  
  if (!deployRes.ok) {
    const text = await deployRes.text()
    if (text) {
      try {
        const err = JSON.parse(text)
        throw new Error(err.message || 'Failed to deploy account')
      } catch {}
    }
    throw new Error(`Deploy failed (Status ${deployRes.status}): ${text}`)
  }

  // 3. Wait for connection (Poll status)
  let retries = 0
  while (retries < 15) {
    await new Promise(r => setTimeout(r, 2000))
    const statusRes = await fetch(`/metaapi/users/current/accounts/${accountId}`, {
      headers: { 'auth-token': token }
    })
    const statusData = await statusRes.json()
    if (statusData.state === 'DEPLOYED' && statusData.connectionStatus === 'CONNECTED') {
      return accountId
    }
    retries++
  }
  
  return accountId 
}

export const fetchMT5Trades = async (accountId, startTime, endTime) => {
  if (!token) throw new Error("MetaAPI token not configured in .env")
  
  const startObj = new Date(startTime)
  const endObj = new Date(endTime)
  
  const res = await fetch(`/metaclient/users/current/accounts/${accountId}/history-orders/time-range?startTime=${startObj.toISOString()}&endTime=${endObj.toISOString()}`, {
    headers: { 'auth-token': token }
  })
  
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Failed to fetch history')
  }
  
  return await res.json()
}
