import { Router } from "express";
import { obfuscate } from "../../util/v1/obfuscate";

const router = Router();

router.post('/obfuscate', (req, res) => {
  const { content, config } = <any>req.body;
  const errorMessage = content && config ? null : 'Missing body request';

  if (errorMessage)
    return res.status(400).json({ success: false, error: errorMessage });

  obfuscate(content, config).then((result) => {
    if (result.success)
      return res.json(result);
    res.status(400).json(result);
  });
});

export default router;