Read CLAUDE.md and /mnt/skills/public/frontend-design/SKILL.md before starting.

Build a multi-step welcome modal for first-time login users.
This replaces the /first-login page — modal appears on top of home page.

== TRIGGER ==
In app/(public)/page.tsx or layout.tsx:
Check session user: is_temp_password = true
→ render <FirstLoginModal /> on top of page
Modal has no close button, cannot be dismissed
Blurred background (backdrop-blur-sm + bg-black/30)

== COMPONENT ==
File: components/auth/first-login-modal.tsx
"use client"

Three steps managed by local state:
step: 1 | 2 | 3

== TAILWIND ANIMATION SETUP ==
Use Tailwind CSS only — no framer-motion.

Add to tailwind.config.ts keyframes and animation:
keyframes: {
slideInRight: {
'0%': { transform: 'translateX(100%)', opacity: '0' },
'100%': { transform: 'translateX(0)', opacity: '1' },
},
slideOutLeft: {
'0%': { transform: 'translateX(0)', opacity: '1' },
'100%': { transform: 'translateX(-100%)', opacity: '0' },
},
fadeInScale: {
'0%': { transform: 'scale(0)', opacity: '0' },
'100%': { transform: 'scale(1)', opacity: '1' },
},
fadeIn: {
'0%': { opacity: '0', transform: 'translateY(8px)' },
'100%': { opacity: '1', transform: 'translateY(0)' },
},
},
animation: {
'slide-in-right': 'slideInRight 0.3s ease-in-out',
'slide-out-left': 'slideOutLeft 0.3s ease-in-out',
'fade-in-scale': 'fadeInScale 0.4s ease-out',
'fade-in': 'fadeIn 0.4s ease-out',
'fade-in-delay': 'fadeIn 0.4s ease-out 0.2s both',
'fade-in-delay-2': 'fadeIn 0.4s ease-out 0.4s both',
}

Step transition:
On "Get Started" click:
Current step div gets class: animate-slide-out-left
After 300ms: set step = 2
New step div mounts with class: animate-slide-in-right

Use a key prop on each step div to trigger remount animation:

  <div key={step} className="animate-slide-in-right">

== MODAL WRAPPER ==
Position: fixed inset-0 z-50
Backdrop: bg-black/30 backdrop-blur-sm
Card: bg-white rounded-2xl shadow-2xl
Desktop: max-w-md w-full mx-auto mt-20
Mobile (< 640px): full screen, rounded-none, m-0, min-h-screen
Card padding: p-8 desktop, p-6 mobile
Min height: 440px — consistent across steps
Overflow: hidden (prevents animation bleed)

== STEP 1 — WELCOME ==
Layout:
FDM logo top center (use existing logo component)
Heading (Playfair Display, text-2xl font-bold text-stone-900):
"Welcome to FDM, [first_name]! 👋"
Body (Lato, text-base text-stone-600, mt-3):
"We're glad you're here. This is your home for community
updates, attendance, and more. Let's get your account
ready — it only takes a moment."
Button (full width, bg-[#a92227] text-white, mt-8, h-12):
"Get Started →"
Progress dots (bottom center, mt-6):
● ○ → filled dot = brand red, empty = stone-300

== STEP 2 — SET PASSWORD ==
Layout:
Lock icon (lucide Lock, size 40, text-[#a92227], mx-auto)
Heading (Playfair Display, text-xl font-bold): "Secure Your Account"
Subtext (text-sm text-stone-500, mt-1):
"Create a password only you know."

New Password (mt-6):
Label: "New Password"
shadcn Input type=password h-12
Show/hide toggle button inside input (lucide Eye / EyeOff)

Live requirements (mt-3, space-y-1):
Three rows each: icon + text
Not met: circle icon (lucide Circle, size 14) text-stone-400
Met: check icon (lucide CheckCircle2, size 14) text-green-600 + text turns text-green-600
Requirements:
At least 8 characters
At least one uppercase letter
At least one number

Confirm Password (mt-4):
Label: "Confirm Password"
shadcn Input type=password h-12
Show/hide toggle
Inline error below (text-sm text-red-500):
"Passwords do not match" — only show when:
confirmPassword.length > 0 AND passwords don't match

Submit button (full width, bg-[#a92227], h-12, mt-6):
"Set Password →"
Disabled (opacity-50 cursor-not-allowed) until:
ALL 3 requirements met AND passwords match AND confirm not empty
Shows Loader2 spinner when submitting

Progress dots (mt-6): ● ●

== STEP 3 — SUCCESS + NEXT STEPS ==
Layout:
Checkmark icon (lucide CheckCircle2, size-64, text-green-500)
class: animate-fade-in-scale mx-auto
Heading (Playfair Display, text-xl font-bold, animate-fade-in):
"You're all set, [first_name]!"
Body (text-sm text-stone-500, animate-fade-in):
"Your account is ready and your QR code has been generated."

-- NEXT STEPS SECTION (animate-fade-in-delay) --
Divider line (border-t border-stone-100 mt-6 mb-4)
Small label (text-xs text-stone-400 uppercase tracking-wide mb-3):
"While you're here"

Two navigation cards (stacked, gap-2):
Card 1:
Icon: lucide UserCircle (text-[#a92227])
Title (text-sm font-semibold): "Complete Your Profile"
Subtitle (text-xs text-stone-400):
"Add your photo, birthday, and contact info."
Right arrow: lucide ChevronRight (text-stone-300)
onClick: router.push('/my-profile')
Hover: bg-stone-50 transition-colors cursor-pointer
class: animate-fade-in-delay

    Card 2:
      Icon: lucide QrCode (text-[#a92227])
      Title (text-sm font-semibold): "View Your QR Code"
      Subtitle (text-xs text-stone-400):
        "Use this for attendance at community events."
      Right arrow: lucide ChevronRight (text-stone-300)
      onClick: router.push('/my-qr')
      Hover: bg-stone-50 transition-colors cursor-pointer
      class: animate-fade-in-delay-2

Both cards are optional — no required label

Countdown (text-xs text-stone-400 text-center mt-4):
"Continuing in [3]..." — counts down 3 → 2 → 1
class: animate-fade-in-delay

Auto-close after 3 seconds:
useEffect with setInterval every 1 second
countdown state: starts at 3, decrements each second
at 0: router.refresh() → closes modal
(is_temp_password = false so modal won't reappear)

Clicking either card:
Navigates to that route immediately
No need to wait for countdown

No progress dots on step 3

== SERVER ACTION ==
File: app/actions/first-login.ts
"use server"

completeFirstLogin(newPassword: string):
requireAuth()
Validate server-side:
length >= 8
has uppercase letter
has number
if fail → return { success: false, error: "Password does not meet requirements." }
supabase.auth.updateUser({ password: newPassword })
Generate QR: member_qr = crypto.randomUUID()
Update public.users:
is_temp_password = false
account_status = 'verified'
member_qr = generated value
qr_generated_at = new Date()
Attendance backfill:
find guest_logs WHERE email = user.email AND linked_user_id IS NULL
update attendance.user_id = user.id for matching records
set guest_logs.linked_user_id = user.id for matches
revalidatePath('/')
return { success: true } or { success: false, error }

== RULES ==

- No X button anywhere
- No backdrop click dismiss on any step
- Step 3 navigation cards close modal via router navigation
- All inputs h-12 minimum (48px — elderly friendly)
- All text minimum text-sm (14px) — never smaller
- Font: font-playfair for headings, font-lato for body
- shadcn Input and Button for form elements
- TypeScript strict — no any
- npx tsc --noEmit after changes — zero errors
