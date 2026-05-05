import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type SpecialDayRow = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  type: "birthday" | "anniversary" | "relationship" | "holiday" | "other";
};

type CoupleProfileRow = {
  person_one_name: string;
  person_two_name: string;
  love_start_date: string | null;
  person_one_birthday: string | null;
  person_two_birthday: string | null;
};

type NotificationEvent = {
  eventKey: string;
  specialDayId: string | null;
  title: string;
  description: string | null;
  dateLabel: string;
  typeLabel: string;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RECURRING_TYPES = new Set([
  "birthday",
  "anniversary",
  "relationship",
  "holiday",
]);

const TYPE_LABEL: Record<SpecialDayRow["type"], string> = {
  birthday: "Sinh nhật",
  anniversary: "Kỷ niệm",
  relationship: "Mốc yêu nhau",
  holiday: "Ngày lễ",
  other: "Khác",
};

const AUTO_HOLIDAY_DEFINITIONS = [
  {
    key: "valentine",
    monthDay: "02-14",
    title: "Valentine 14/2",
    description: "Ngày lễ Tình nhân - dịp để gửi lời yêu thương ngọt ngào.",
  },
  {
    key: "womens-day",
    monthDay: "03-08",
    title: "Quốc tế Phụ nữ 8/3",
    description: "Một ngày đặc biệt để gửi lời chúc và sự quan tâm.",
  },
  {
    key: "international-happiness-day",
    monthDay: "03-21",
    title: "Ngày Quốc tế Hạnh phúc 21/3",
    description: "Một ngày để cùng nhau lưu giữ niềm vui và hạnh phúc.",
  },
  {
    key: "girlfriend-day",
    monthDay: "08-01",
    title: "Ngày bạn gái 1/8",
    description: "Dịp để dành những điều dễ thương cho người thương.",
  },
  {
    key: "boyfriend-day",
    monthDay: "10-03",
    title: "Ngày bạn trai 3/10",
    description: "Một ngày nhỏ để nói lời yêu và cảm ơn nửa kia.",
  },
  {
    key: "vn-womens-day",
    monthDay: "10-20",
    title: "Phụ nữ Việt Nam 20/10",
    description: "Ngày tôn vinh phụ nữ Việt Nam với những điều dễ thương.",
  },
  {
    key: "christmas-eve",
    monthDay: "12-24",
    title: "Đêm Giáng Sinh 24/12",
    description: "Đêm ấm áp để hẹn hò và trao nhau quà nhỏ.",
  },
  {
    key: "new-year-day",
    monthDay: "01-01",
    title: "Năm mới 1/1",
    description: "Bắt đầu năm mới cùng nhau với thật nhiều yêu thương.",
  },
] as const;

function getTodayParts(timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(new Date());
  const year = Number(
    parts.find((part) => part.type === "year")?.value ?? "1970",
  );
  const month = Number(
    parts.find((part) => part.type === "month")?.value ?? "01",
  );
  const day = Number(parts.find((part) => part.type === "day")?.value ?? "01");
  const isoDate = `${year.toString().padStart(4, "0")}-${month
    .toString()
    .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
  return { year, month, day, isoDate };
}

function getMonthDay(dateInput: string | null) {
  if (!dateInput) return null;
  const [y, m, d] = dateInput.split("-").map((value) => Number(value));
  if (!y || !m || !d) return null;
  return { month: m, day: d, iso: dateInput };
}

function getDateParts(dateInput: string | null) {
  if (!dateInput) return null;
  const [year, month, day] = dateInput.split("-").map((value) => Number(value));
  if (!year || !month || !day) return null;
  return { year, month, day };
}

function getUtcDayIndex(date: { year: number; month: number; day: number }) {
  return Math.floor(Date.UTC(date.year, date.month - 1, date.day) / 86_400_000);
}

function buildAutoHolidayEvents(
  specialDays: SpecialDayRow[],
  today: { month: number; day: number },
) {
  const todayMonthDay = `${today.month.toString().padStart(2, "0")}-${today.day
    .toString()
    .padStart(2, "0")}`;
  const manualHolidayMonthDays = new Set(
    specialDays
      .filter((day) => day.type === "holiday")
      .map((day) => day.date.slice(5)),
  );

  return AUTO_HOLIDAY_DEFINITIONS.filter(
    (holiday) =>
      holiday.monthDay === todayMonthDay &&
      !manualHolidayMonthDays.has(holiday.monthDay),
  ).map((holiday) => ({
    eventKey: `auto-holiday:${holiday.key}`,
    specialDayId: null,
    title: holiday.title,
    description: holiday.description,
    dateLabel: `Hằng năm-${holiday.monthDay}`,
    typeLabel: "Ngày lễ",
  }));
}

function buildLoveMilestoneEvents(
  profile: CoupleProfileRow | null,
  today: { year: number; month: number; day: number; isoDate: string },
) {
  const loveStartDate = getDateParts(profile?.love_start_date ?? null);
  if (!loveStartDate) return [];

  const daysInLove = getUtcDayIndex(today) - getUtcDayIndex(loveStartDate);
  if (daysInLove <= 0) return [];

  const milestoneEvents = new Map<number, NotificationEvent>();
  const addMilestone = (title: string, description: string) => {
    milestoneEvents.set(daysInLove, {
      eventKey: `love-milestone:${daysInLove}`,
      specialDayId: null,
      title,
      description,
      dateLabel: today.isoDate,
      typeLabel: "Mốc yêu nhau",
    });
  };

  if ([99, 500, 999].includes(daysInLove)) {
    addMilestone(
      `${daysInLove} ngày yêu nhau`,
      `Một mốc số đẹp sau ${daysInLove} ngày ở bên nhau.`,
    );
  }

  if (daysInLove >= 1000 && daysInLove % 500 === 0) {
    addMilestone(
      `${daysInLove} ngày yêu nhau`,
      `Cột mốc đặc biệt ${daysInLove} ngày của hai bạn.`,
    );
  }

  if (
    today.month === loveStartDate.month &&
    today.day === loveStartDate.day &&
    today.year > loveStartDate.year
  ) {
    const yearCount = today.year - loveStartDate.year;
    addMilestone(
      `${yearCount} năm yêu nhau`,
      `Kỷ niệm tròn ${yearCount} năm kể từ ngày bắt đầu yêu nhau.`,
    );
  }

  return [...milestoneEvents.values()];
}

function buildTodayEvents(
  specialDays: SpecialDayRow[],
  profile: CoupleProfileRow | null,
  today: { year: number; month: number; day: number; isoDate: string },
) {
  const events: NotificationEvent[] = [];

  for (const day of specialDays) {
    const dayParts = getMonthDay(day.date);
    if (!dayParts) continue;

    const isRecurring = RECURRING_TYPES.has(day.type);
    const isToday = isRecurring
      ? dayParts.month === today.month && dayParts.day === today.day
      : dayParts.iso === today.isoDate;

    if (!isToday) continue;

    events.push({
      eventKey: `special-day:${day.id}`,
      specialDayId: day.id,
      title: day.title,
      description: day.description,
      dateLabel: day.date,
      typeLabel: TYPE_LABEL[day.type],
    });
  }

  events.push(...buildAutoHolidayEvents(specialDays, today));

  const personOneBirthday = getMonthDay(profile?.person_one_birthday ?? null);
  if (
    personOneBirthday &&
    personOneBirthday.month === today.month &&
    personOneBirthday.day === today.day
  ) {
    events.push({
      eventKey: "birthday:person-one",
      specialDayId: null,
      title: `Sinh nhật ${profile?.person_one_name ?? "Người thứ nhất"}`,
      description:
        "Hôm nay là ngày sinh nhật. Đừng quên gửi lời chúc thật ngọt ngào.",
      dateLabel: profile?.person_one_birthday ?? today.isoDate,
      typeLabel: "Sinh nhật",
    });
  }

  const personTwoBirthday = getMonthDay(profile?.person_two_birthday ?? null);
  if (
    personTwoBirthday &&
    personTwoBirthday.month === today.month &&
    personTwoBirthday.day === today.day
  ) {
    events.push({
      eventKey: "birthday:person-two",
      specialDayId: null,
      title: `Sinh nhật ${profile?.person_two_name ?? "Người thứ hai"}`,
      description:
        "Hôm nay là ngày sinh nhật. Đừng quên gửi lời chúc thật ngọt ngào.",
      dateLabel: profile?.person_two_birthday ?? today.isoDate,
      typeLabel: "Sinh nhật",
    });
  }

  events.push(...buildLoveMilestoneEvents(profile, today));

  return events;
}

function createEmailHtml(recipientName: string, events: NotificationEvent[]) {
  const escapeHtml = (value: string) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const items = events
    .map(
      (event) => `
        <li style="margin: 0 0 12px 0; padding: 12px 14px; border-radius: 14px; background: #fff5f8; border: 1px solid #f0d0db;">
          <p style="margin: 0 0 4px 0; font-size: 16px; color: #5a3b45; font-weight: 700;">${escapeHtml(event.title)}</p>
          <p style="margin: 0 0 4px 0; font-size: 13px; color: #7f5d67;">${escapeHtml(event.typeLabel)} • Ngày: ${escapeHtml(event.dateLabel)}</p>
          ${
            event.description
              ? `<p style="margin: 0; font-size: 13px; color: #7f5d67;">${escapeHtml(event.description)}</p>`
              : ""
          }
        </li>
      `,
    )
    .join("");

  return `
    <div style="max-width: 640px; margin: 0 auto; padding: 24px; background: #fff; border-radius: 18px; border: 1px solid #f2dce4; font-family: ui-sans-serif, -apple-system, Segoe UI, Roboto, Helvetica, Arial;">
      <h1 style="margin: 0 0 10px; color: #5a3b45; font-size: 24px;">Nhắc nhở ngày đặc biệt</h1>
      <p style="margin: 0 0 18px; color: #7a5964; font-size: 14px;">Xin chào ${escapeHtml(recipientName)}, hôm nay có các ngày đặc biệt cần nhớ:</p>
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${items}
      </ul>
      <p style="margin: 20px 0 0; color: #8e6a75; font-size: 12px;">Được gửi từ Couple Wishlist.</p>
    </div>
  `;
}

async function sendEmailViaSmtp(params: {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  to: string;
  subject: string;
  html: string;
}) {
  const transporter = nodemailer.createTransport({
    host: params.host,
    port: params.port,
    secure: params.secure,
    auth: {
      user: params.user,
      pass: params.pass,
    },
  });

  await transporter.sendMail({
    from: params.from,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}

async function handleCron(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : "";

  if (!cronSecret || bearerToken !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || "465");
  const smtpSecure =
    (process.env.SMTP_SECURE || "true").toLowerCase() !== "false";
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const emailFrom = process.env.NOTIFICATION_FROM_EMAIL;
  if (
    !smtpHost ||
    !smtpUser ||
    !smtpPass ||
    !emailFrom ||
    Number.isNaN(smtpPort)
  ) {
    return NextResponse.json(
      {
        error:
          "Missing SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS or NOTIFICATION_FROM_EMAIL",
      },
      { status: 500 },
    );
  }

  const timeZone = process.env.NOTIFICATION_TIMEZONE || "Asia/Ho_Chi_Minh";
  const today = getTodayParts(timeZone);
  const supabase = createSupabaseAdminClient();

  const [
    { data: specialDays, error: specialDayError },
    { data: profile, error: profileError },
    { data: admins, error: adminError },
  ] = await Promise.all([
    supabase.from("special_days").select("id, title, description, date, type"),
    supabase
      .from("couple_profile")
      .select(
        "id, person_one_name, person_two_name, love_start_date, person_one_birthday, person_two_birthday",
      )
      .limit(1)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("id, name, email, role")
      .eq("role", "admin"),
  ]);

  if (specialDayError || profileError || adminError) {
    return NextResponse.json(
      {
        error: "Failed to load data",
        details: {
          specialDayError: specialDayError?.message,
          profileError: profileError?.message,
          adminError: adminError?.message,
        },
      },
      { status: 500 },
    );
  }

  const recipientsFromEnv = (process.env.NOTIFICATION_TO_EMAILS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const recipients = Array.from(
    new Set([
      ...(admins?.map((admin) => admin.email).filter(Boolean) ?? []),
      ...recipientsFromEnv,
    ]),
  );

  if (!recipients.length) {
    return NextResponse.json({
      sent: 0,
      skipped: 0,
      reason: "No recipients configured",
    });
  }

  const events = buildTodayEvents(specialDays ?? [], profile ?? null, today);
  if (!events.length) {
    return NextResponse.json({
      sent: 0,
      skipped: recipients.length,
      reason: "No special events today",
      date: today.isoDate,
    });
  }

  const { data: existingLogs, error: existingLogError } = await supabase
    .from("special_day_notification_logs")
    .select("event_key, target_email")
    .eq("notify_date", today.isoDate);

  if (existingLogError) {
    return NextResponse.json(
      { error: existingLogError.message },
      { status: 500 },
    );
  }

  const existingKeys = new Set(
    (existingLogs ?? []).map(
      (row) => `${row.target_email.toLowerCase()}::${row.event_key}`,
    ),
  );

  let sent = 0;
  let skipped = 0;
  const failures: string[] = [];

  for (const recipient of recipients) {
    const normalized = recipient.toLowerCase();
    const pendingEvents = events.filter(
      (event) => !existingKeys.has(`${normalized}::${event.eventKey}`),
    );

    if (!pendingEvents.length) {
      skipped += 1;
      continue;
    }

    const recipientName =
      admins?.find((admin) => admin.email.toLowerCase() === normalized)?.name ??
      recipient;

    try {
      await sendEmailViaSmtp({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        user: smtpUser,
        pass: smtpPass,
        from: emailFrom,
        to: recipient,
        subject: `Ngày đặc biệt hôm nay (${today.isoDate})`,
        html: createEmailHtml(recipientName, pendingEvents),
      });

      const logPayload = pendingEvents.map((event) => ({
        event_key: event.eventKey,
        special_day_id: event.specialDayId,
        target_email: recipient,
        notify_date: today.isoDate,
      }));

      const { error: insertLogError } = await supabase
        .from("special_day_notification_logs")
        .insert(logPayload);

      if (insertLogError) {
        failures.push(
          `Log insert failed for ${recipient}: ${insertLogError.message}`,
        );
      }

      sent += 1;
    } catch (error) {
      failures.push(
        `Send failed for ${recipient}: ${(error as Error).message}`,
      );
    }
  }

  return NextResponse.json({
    date: today.isoDate,
    totalEvents: events.length,
    recipients: recipients.length,
    sent,
    skipped,
    failures,
  });
}

export async function GET(request: NextRequest) {
  return handleCron(request);
}

export async function POST(request: NextRequest) {
  return handleCron(request);
}
