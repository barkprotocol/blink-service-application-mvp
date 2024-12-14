export async function getDonations(params: { walletAddress: string }) {
    const response = await fetch('/api/actions.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'donation',
        params,
      }),
    })
    return response.json()
  }
  
  export async function makePayment(params: { amount: number; recipient: string }) {
    const response = await fetch('/api/actions.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'payment',
        params,
      }),
    })
    return response.json()
  }
  
  export async function mintNFT(params: { metadataUri: string; recipient: string }) {
    const response = await fetch('/api/actions.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'nft',
        params,
      }),
    })
    return response.json()
  }
  
  export async function executeGovernanceAction(params: { proposal: string; vote: boolean }) {
    const response = await fetch('/api/actions.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'governance',
        params,
      }),
    })
    return response.json()
  }
  
  export async function getBlinks(params: { walletAddress: string }) {
    const response = await fetch('/api/actions.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'get-blinks',
        params,
      }),
    })
    return response.json()
  }
  
  export async function sendGift(params: { recipient: string; blinkId: string }) {
    const response = await fetch('/api/actions.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'gift',
        params,
      }),
    })
    return response.json()
  }
  
  