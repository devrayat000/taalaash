// import { createServerFn } from "@tanstack/react-start";
// import { BetaAnalyticsDataClient } from "@google-analytics/data";
// import dayjs from "dayjs";

// const analyticsDataClient = new BetaAnalyticsDataClient({
//   credentials: {
//     type: "service_account",
//     project_id: "taalaash",
//     private_key_id: "51abe5413b795d89e520714011323a83178ced46",
//     private_key:
//       "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDWa1HI9j6R3pTm\nTq/uMd9fcOncwObIcuy2jOK2F7I2fnLEvt1fkS/jo3A+TI5fOmqVzvyUwEGxh4oH\nVbQYu08mRIMGVx6TvZCwK/yH4OdRYK84MqxCUGByyQXlSM6qZXZnQruJA+LY4qGe\nn25/ZR8hZMeOlKg0n2OSJrDTorxMXPZrWbyj6m00ifa88jTjF0uU/IUR5iBsG4Iz\nRPQYk4SVFFhpHYwdNMs8tK0sSAIBXR8O2IovUxktCh4uPJ+Ax+48gd4LvNEOAquq\npxyPWpXfgCV9WevaNMhzY0y0USlRUGZlJHYITd0iLX0Pzz3w8m9vXEBM6voDxzXj\n5N+NQrl/AgMBAAECggEABypw3aFBHscDKwuEmBaAdH+X5KZpcA7LLtbqp0n1TRp+\nldbRriVNyqC0B/RmBfRGeJ3vDFC805caO5c8ATq7A10HgWKGZW91UqOiQmZAsoHj\nduuyCn/hmCR0JMW4D457y04VaaoJzEIysPifw6tz1fTLDRe646R3uleZrWNDQd7d\nhKjXoM4dCuZGhbEKCQnJdJUdl48audXRRDJ5/dEnS4aUXH2qFUvceR7X0tTBUGS0\nl33wJfUrOmK/Ao339GCYvy+QraGkxZJDfuB1/dmhD5iVVoGTmb+cv6tPI26TBtMC\nEIennwuthxVOt6tz1jdok7XbeCW1fW2OTCmCTXOCaQKBgQDyeRTbtneAR9DaGIrh\nSADGlHFnUiLl7f0uYY/axYpZ2/HkvVtCbcdk9ebXQdNEp8pylwc7kGLaWysLOp+T\nqZdkKdCnXmYK/HYok29+1En4mpudOZH6RRIMFRHiKYmUGqByIXg7sXIkKdkEUeHd\nMd3wFIq5H8kpoP9eGHH0EFuEuQKBgQDiYZVi19KBAZuql796+EX1U2WvSljKF1S9\n1LFlIXoYwJRmxamO7Tk2gbn69LdDR/Rj3DvYxc6RzyCssYbUNrPX7z100ckjjN1/\nBmyr7dp3RbgVH7/IYoZ4oGaLZD/+lExy/JlAAoANXwXoT1XniP4lkwWnXmteKG8G\n35EwQOOD9wKBgQCVVLDd5/CNFq2vxDG0MQ4ZPs7g3RsVFI87A2b/S227jdPaFiyg\nKtAEg9VZePbOb7AlBpKzwma/KCrITaB95pKQY5hXm7GozndO4g5mxAOSklWIbS5U\nPjmxK0DKUt6iUgvCfo535P7w+rznBi7edZnEBEKzZLoVY0wi/VchAvn6MQKBgDKE\ntlKNeSNi2XszS/7EItCBYOLCQ5gtprKKIWBBHT8i0rswhwsnMypPvtIbBD6WcxpJ\nzm0sj1GImHERWNZIss+QSvWjzzAIwnETXPLtLGCLhW3pXOH54qpOmTOoFoPYUksi\nxYw8Qpk5SFc0RSZbMuPtsEhOUMV9XnF5OKw8/si3AoGBAO+Lxf4mkANBJ7UC99g5\nm6IUyL6V9y/XmXGL0qlrowA9AuNxzFXSfw/FpAIvakJaExnNSBkNp95QC64cCDr8\n8jfpFChmXHZJM5q8sCYGNWQXD7sViPJ9tnjTb8lftGHHKktA21pRqRyisCfKvHCP\nlt9qxha8GxSTInDkmUZW+nEh\n-----END PRIVATE KEY-----\n",
//     client_email: "taalaash-analytics@taalaash.iam.gserviceaccount.com",
//     client_id: "113618053435846384942",
//     // token_url: "https://oauth2.googleapis.com/token",
//     universe_domain: "googleapis.com",
//   },
// });

// const PROPERTY_ID = 441360510;

// export const runReport = createServerFn({ method: "GET" }).handler(async () => {
//   const [response] = await analyticsDataClient.runReport({
//     property: `properties/${PROPERTY_ID}`,
//     // dateRanges: dateRanges,
//     dateRanges: [
//       {
//         startDate: dayjs().subtract(7, "day").format("YYYY-MM-DD"),
//         endDate: "today",
//       },
//     ],
//     dimensions: [
//       {
//         name: "date",
//       },
//     ],
//     metrics: [{ name: "active1DayUsers" }],
//   });

//   const report = response.rows?.map((row: any) => {
//     return {
//       date: row.dimensionValues?.[0].value || dayjs().format("YYYY-MM-DD"),
//       active1DayUsers: parseInt(row.metricValues?.[0].value ?? "0"),
//     };
//   });

//   return report || [];
// });
