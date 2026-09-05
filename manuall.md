# 🧪 AriseSell — WhatsApp AI ম্যানুয়ালি টেস্ট করার ৩টি সহজ উপায় (Manual Testing Guide)

আপনার WhatsApp ইন্টিগ্রেশন এবং **Google Gemini 3.5 Flash** AI সেলস বট পরীক্ষা করার জন্য নিচের যেকোনো একটি উপায় অনুসরণ করুন:

---

## 🖥️ উপায় ১: ব্রাউজার ড্যাশবোর্ড থেকে টেস্ট করা (০ সেটআপ / সবচেয়ে দ্রুত)

কোনো এক্সটার্নাল অ্যাপ বা ngrok ছাড়াই সরাসরি ব্রাউজার ড্যাশবোর্ড থেকে পরীক্ষা করুন:

### ১. Omnichannel Live Inbox-এ টেস্ট:
1. ব্রাউজারে ওপেন করুন: **[http://localhost:3000/console/inbox](http://localhost:3000/console/inbox)**
2. বাম পাশের তালিকা থেকে যেকোনো **WhatsApp** চ্যাট থ্রেড সিলেক্ট করুন (যেমন: *Sadia Rahman* বা *Anisur Rahman*)।
3. নিচের মেসেজ বক্সে যেকোনো প্রশ্ন লিখে পাঠান (যেমন: *"জামদানি শাড়ির দাম কত? সিলেটে পাঠাতে কত দিন লাগবে?"*)।
4. **Google Gemini 3.5 Flash** তাৎক্ষণিকভাবে উত্তর দেবে এবং উপরে **Intent Badge** ও কুরিয়ার ডেলিভারি ফি হিসেব দেখতে পাবেন।
5. আপনি চাইলে **"Take Over"** বাটনে ক্লিক করে হিউম্যান মোডে নিজে কাস্টমার কেয়ার মেসেজ টাইপ করতে পারেন।

---

### ২. AI Assistant Playground-এ টেস্ট:
1. ওপেন করুন: **[http://localhost:3000/console/test-ai](http://localhost:3000/console/test-ai)**
2. কাস্টমার মোড অন করে যেকোনো বাংলা বা বাংলিশ মেসেজ টাইপ করুন।
3. AI বট স্বয়ংক্রিয়ভাবে ব্র্যান্ড ভয়েস, স্টক স্ট্যাটাস এবং সঠিক ক্যাটালগ প্রাইস মিলিয়ে উত্তর দেবে।

---

## 💻 উপায় ২: PowerShell / cURL দিয়ে রিয়েল মেটা ওয়েব হুক ট্রিগার করা

মেটা সার্ভার যেভাবে আপনার ব্যাকএন্ডে মেসেজ পুশ করে, ঠিক সেভাবে একটি ফেক ইভেন্ট পাঠিয়ে পরীক্ষা করতে আপনার টার্মিনাল বা PowerShell-এ এই কমান্ডটি চালান:

```powershell
curl -X POST "http://localhost:8000/api/v1/webhooks/whatsapp" `
  -H "Content-Type: application/json" `
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "WABA_109827364519283",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {"display_phone_number": "+8801711234567", "phone_number_id": "102938475610293"},
          "contacts": [{"profile": {"name": "Test User"}, "wa_id": "8801711000001"}],
          "messages": [{
            "from": "8801711000001",
            "id": "wamid.test_msg_001",
            "timestamp": "1725370000",
            "text": {"body": "এই শাড়ির দাম কত? ক্যাশ অন ডেলিভারিতে অর্ডার করতে চাই।"},
            "type": "text"
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

👉 **কনসোল ফলাফল:** সাথে সাথে আপনার ব্যাকএন্ড টার্মিনালে দেখতে পাবেন:
```
[WhatsApp Inbound Webhook] Received from 8801711000001: 'এই শাড়ির দাম কত?...'
[WhatsApp AI Reply (Gemini 3.5 Flash)]: 'আমাদের নীল জামদানি শাড়ির মূল্য ৳৬,৮৫০ টাকা...'
```

---

## 📱 উপায় ৩: আপনার মোবাইল থেকে রিয়েল হোয়াটসঅ্যাপে মেসেজ পাঠিয়ে টেস্ট করা

আপনার নিজের মোবাইল ফোন থেকে বিজনেসের আসল হোয়াটসঅ্যাপ নাম্বারে মেসেজ পাঠিয়ে পরীক্ষা করতে:

### ১. ব্যাকএন্ড সার্ভার চালু রাখুন:
```powershell
.\backend\.venv-next\Scripts\uvicorn app.main:app --reload --port 8000
```

### ২. ngrok টানেল চালু করুন:
```powershell
ngrok http 8000
```
*(এটি আপনাকে একটি পাবলিক URL দেবে, যেমন: `https://abc-123.ngrok-free.app`)*

### ৩. Meta Developer Portal-এ Webhook সেট করুন:
1. যান **[developers.facebook.com/apps](https://developers.facebook.com/apps)** $\rightarrow$ আপনার App সিলেক্ট করুন $\rightarrow$ **WhatsApp > Configuration**-এ যান।
2. **Callback URL:** `https://<your-ngrok-url>.ngrok-free.app/api/v1/webhooks/whatsapp`
3. **Verify Token:** `arisesell_verify_token`
4. **Verify and Save** চাপুন এবং `messages` ফিল্ডটি Subscribe করুন।

### ৪. লাইভ টেস্ট করুন:
* আপনার মোবাইল থেকে বিজনেসের ওই হোয়াটসঅ্যাপ নাম্বারে মেসেজ পাঠান (যেমন: *"Hi, ata ki shop?"* বা *"দাম কত?"*)।
* **১-২ সেকেন্ডের মধ্যে আপনার ফোনে AI-এর বাংলা রিপ্লাই চলে আসবে!** 🚀
