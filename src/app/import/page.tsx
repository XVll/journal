"use client";
import {useImportTrades} from "@/features/import/hooks/use-trade";
import {testTradeData} from "@/features/import/lib/test-data";
import {Button} from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import DatePicker from "@/components/custom/date-picker";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { title } from "process";
import { Description } from "@radix-ui/react-dialog";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, Form } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import ThemeSwitch from "@/components/custom/theme-switch";

const importSchema = z.object({
    account: z.string(),
    tradeData: z.string(),
    date : z.date({
        required_error: "Date is required",
    })
});

const Page = () => {
    const {mutateAsync} = useImportTrades();
    const form = useForm<z.infer<typeof importSchema>>({
        resolver: zodResolver(importSchema),
        defaultValues: {
            date: new Date(),
        },
    });

    const onSubmit = async (data: z.infer<typeof importSchema>) => {
        toast({
            title: "Importing Trades",
            description: (
                <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                    <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                </pre>
            ),
        });
        //for (let i = 1; i < 28; i++){
            await mutateAsync({ account:data.account, tradeData: testTradeData , year:data.date.getFullYear(), month:data.date.getMonth(), day:data.date.getDate() });
       // }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
                <FormField
                    control={form.control}
                    name="tradeData"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Add Trades</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Tell us a little bit about yourself" className="resize-none" {...field} />
                            </FormControl>
                            <FormDescription>
                                You can <span>@mention</span> other users and organizations.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Trade Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                        >
                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormDescription> This is the date of the trade.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="account"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input placeholder="shadcn" {...field} />
                            </FormControl>
                            <FormDescription>This is your public display name.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    );
    };
    


export default Page

