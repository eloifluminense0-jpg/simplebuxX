export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { amount, customer, items } = req.body;
    const secretKey = process.env.VELANI_SECRET_KEY;

    if (!secretKey) {
      return res.status(500).json({ error: 'Chave secreta Velani não configurada no servidor.' });
    }

    const respostaVelani = await fetch('https://api.velanipagamentos.com.br/v1/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secretKey}`
      },
      body: JSON.stringify({
        amount,
        paymentMethod: 'pix',
        customer,
        items
      })
    });

    const dados = await respostaVelani.json();

    if (!respostaVelani.ok) {
      return res.status(respostaVelani.status).json({ error: dados.message || 'Erro ao comunicar com a Velani' });
    }

    // Normaliza os dados para garantir que o frontend receba o Pix Copia e Cola
    const pixData = dados.pix || dados.payment?.pix || {};
    
    return res.status(200).json({
      success: true,
      pix: {
        copyPaste: pixData.copyPaste || pixData.qrcode || dados.copyPaste || dados.qrcode,
        qrCodeBase64: pixData.qrCodeBase64 || dados.qrCodeBase64
      }
    });
  } catch (erro) {
    console.error('Erro no checkout:', erro);
    return res.status(500).json({ error: 'Erro interno ao processar o pagamento.' });
  }
}
