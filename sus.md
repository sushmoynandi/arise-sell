# 📱 Meta WhatsApp Cloud API — নিজস্ব বিজনেস/পার্সোনাল নাম্বার ব্যবহারের সম্পূর্ণ গাইড

আপনি যদি মেটার ফ্রি টেস্ট নাম্বার (`+1 555...`) ব্যবহার না করে আপনার **নিজস্ব বাংলাদেশি বা যেকোনো পার্সোনাল/বিজনেস ফোন নাম্বার (যেমন: `+880 17...`)** দিয়ে AI অটো-রিপ্লাই চালু করতে চান, তাহলে নিচের ধাপগুলো অনুসরণ করুন।

---

## ⚠️ সবচেয়ে গুরুত্বপূর্ণ শর্ত (Important Requirement)

> **মেটা ক্লাউড এপিআই-তে যুক্ত করার আগে:**
> আপনার যে নাম্বারটি যুক্ত করতে চান, সেটি যদি বর্তমানে আপনার মোবাইলের সাধারণ **WhatsApp** বা **WhatsApp Business** অ্যাপে লগইন করা থাকে, তবে ক্লাউড এপিআই-তে যুক্ত করার আগে অ্যাপ থেকে অ্যাকাউন্টটি ডিলিট করতে হবে:
> * মোবাইলে WhatsApp ওপেন করুন $\rightarrow$ **Settings** $\rightarrow$ **Account** $\rightarrow$ **Delete Account** চাপুন।
> *(কারণ একটি নাম্বার একই সাথে মোবাইল অ্যাপ এবং ক্লাউড এপিআই সার্ভার দুটিতে থাকতে পারে না। ক্লাউড এপিআই-তে যুক্ত হলে সব মেসেজ সরাসরি আপনার AriseSell ড্যাশবোর্ডে আসবে।)*

---

## 🛠️ ৫টি ধাপে নিজস্ব নাম্বার যুক্ত করার নিয়ম

### ধাপ ১: Meta Developer Portal-এ নাম্বার যুক্ত করুন
1. ব্রাউজারে যান: **[developers.facebook.com/apps](https://developers.facebook.com/apps)**
2. আপনার তৈরি করা App-টিতে ক্লিক করুন।
3. বাম পাশের মেন্যু থেকে যান: **WhatsApp > API Setup**
4. পেজের নিচে স্ক্রোল করে **"Step 5: Add a phone number"** সেকশনে যান এবং **"Add Phone Number"** বাটনে ক্লিক করুন।

---

### ধাপ ২: বিজনেস প্রোফাইল ও নাম্বার ভেরিফিকেশন
1. **Business Profile Information:**
   * **Profile Display Name:** আপনার দোকানের নাম লিখুন (যেমন: `Nokshi & Co.`)
   * **Timezone:** Asia/Dhaka
   * **Category:** Shopping & Retail / E-Commerce
2. **Phone Number:**
   * কান্ট্রি কোড সিলেক্ট করুন: **Bangladesh (+880)**
   * আপনার ফোন নাম্বারটি লিখুন (যেমন: `01711234567`)
   * **SMS** অথবা **Voice Call** অপশন বেছে নিয়ে **Next** চাপুন।
3. মেটা আপনার সিমে **৬-ডিজিটের ভেরিফিকেশন কোড** পাঠাবে। কোডটি দিয়ে **Verify** করুন।

---

### ধাপ ৩: মেটা থেকে Phone Number ID সংগ্রহ করুন
ভেরিফাই করার পর **WhatsApp > API Setup** পেজে আপনি ২টি আইডি দেখতে পাবেন:
1. **Phone Number ID:** (যেমন: `109283746501928`) $\leftarrow$ *এটি লাগবে*
2. **WhatsApp Business Account ID (WABA ID):** (যেমন: `192837465019283`)

---

### ধাপ ৪: পার্মানেন্ট অ্যাক্সেস টোকেন (System User Token) তৈরি করুন
মেটার টেস্ট টোকেন ২৪ ঘণ্টা পর মেয়াদোত্তীর্ণ হয়ে যায়। সারাজীবন নিরবচ্ছিন্নভাবে চলার জন্য পার্মানেন্ট টোকেন নিন:
1. যান: **[business.facebook.com/settings](https://business.facebook.com/settings)**
2. বাম পাশের মেন্যু থেকে **Users > System Users**-এ ক্লিক করুন।
3. **Add** বাটনে ক্লিক করে নাম দিন `AriseSell Bot` এবং Role দিন **Admin**।
4. তৈরি হওয়া System User-এর পাশে **"Generate New Token"** চাপুন।
5. আপনার App সিলেক্ট করে নিচের পারমিশন দুটিতে টিক দিন:
   * ✅ `whatsapp_business_messaging`
   * ✅ `whatsapp_business_management`
6. **Generate Token** চাপুন এবং টোকেনটি কপি করে সংরক্ষণ করুন (এটি আর কখনো এক্সপায়ার হবে না)।

---

### ধাপ ৫: `.env` ফাইল আপডেট করুন
আপনার প্রজেক্টের রুট ডিরেক্টরির [`.env`](file:///E:/Ship%20Studio/next-product-2/.env) ফাইলে সংগ্রহ করা মানগুলো বসিয়ে দিন:

```env
# ── Google Gemini AI ──
GOOGLE_API_KEY=AIzaSy... (আপনার Gemini API Key)
GEMINI_API_KEY=AIzaSy...

# ── আপনার নিজস্ব Meta WhatsApp Credentials ──
WHATSAPP_PHONE_NUMBER_ID=109283746501928     <-- (আপনার নিজস্ব নাম্বারের Phone ID)
WHATSAPP_WABA_ID=192837465019283             <-- (আপনার WABA ID)
META_PAGE_ACCESS_TOKEN=EAAG...               <-- (আপনার পার্মানেন্ট System User Token)
META_VERIFY_TOKEN=arisesell_verify_token   <-- (যেকোনো গোপন শব্দ)
```

---

## 🌐 ধাপ ৬: Webhook কানেক্ট করুন (ngrok দিয়ে)

১. টার্মিনালে লোকালহোস্ট টানেল চালু করুন:
```bash
ngrok http 8000
```
*(এটি আপনাকে একটি পাবলিক URL দেবে, যেমন: `https://abc-123.ngrok-free.app`)*

২. Meta Developer Portal-এ গিয়ে **WhatsApp > Configuration**-এ যান:
* **Callback URL:** `https://abc-123.ngrok-free.app/api/v1/webhooks/whatsapp`
* **Verify Token:** `arisesell_verify_token`
* **Verify and Save** চাপুন।

৩. **Webhook Fields** তালিকা থেকে **`messages`** অপশনটিতে **Subscribe** ক্লিক করুন।

---

## 🎉 এখন লাইভ টেস্ট করুন!

এখন বিশ্বের যেকোনো ব্যক্তি যেকোনো ফোন নাম্বার থেকে আপনার ওই নিজস্ব হোয়াটসঅ্যাপ নাম্বারে মেসেজ দিলে:
1. মেসেজটি সরাসরি আপনার সার্ভারে চলে আসবে।
2. **Google Gemini 3.5 Flash** ক্যাটালগ ও ডেলিভারি রেট হিসেব করে **১-২ সেকেন্ডের মধ্যে** বাংলায় স্বয়ংক্রিয় উত্তর দেবে।
3. সব কথোপকথন লাইভ দেখতে পাবেন আপনার **[http://localhost:3000/console/inbox](http://localhost:3000/console/inbox)**-এ! 🚀
