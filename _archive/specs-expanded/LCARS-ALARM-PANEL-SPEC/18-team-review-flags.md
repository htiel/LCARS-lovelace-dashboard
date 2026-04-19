## 17. Team Review Flags

- **Geordi Review Required**: Shield SVG design, dynamic frame color shifting across alarm states, Red Alert pulse animation intensity, keypad layout and pill-button sizing, countdown display in the viewscreen. All visual design elements need Geordi's sign-off for LCARS compliance before implementation.
- **Worf Review Required (MANDATORY)**: 
  1. `AlarmCodeHandler` — PIN code handling, memory management, input masking, max-length enforcement (§7.5)
  2. `armAlarm()` / `disarmAlarm()` — service calls with code parameter, input validation (§7.6)
  3. Keypad DOM — verify code never appears in DOM attributes, dataset, console, or state objects
  4. `code_arm_required` / `code_format` handling — ensure code requirements are enforced client-side
  5. Error feedback — verify wrong-code shake animation doesn't leak timing information about code validation
  6. CSP implications — no external resources, no eval, no inline event handlers in the keypad

---

*"A Klingon does not enter codes. A Klingon verifies identity through combat. But since this is a Federation ship... the keypad will suffice. Make it secure."*  
— Worf, Tactical Station, Main Bridge

---
