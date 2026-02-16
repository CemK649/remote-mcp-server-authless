import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";

// Define our MCP agent with tools
export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Authless Calculator",
		version: "1.0.0",
	});

	async init() {
		// Simple addition tool

		this.server.tool("search_cargo",{ tn: z.number(), async ({tn}) => ({
			content: [{type: "text", text: String(tn) }]
		}));
		
		this.server.tool("add", { a: z.number(), b: z.number() }, async ({ a, b }) => ({
			content: [{ type: "text", text: String(a + b) }],
		}));

		// Calculator tool with multiple operations
		this.server.tool(
			"calculate",
			{
				operation: z.enum(["add", "subtract", "multiply", "divide"]),
				a: z.number(),
				b: z.number(),
			},
			async ({ operation, a, b }) => {
				let result: number;
				switch (operation) {
					case "add":
						result = a + b;
						break;
					case "subtract":
						result = a - b;
						break;
					case "multiply":
						result = a * b;
						break;
					case "divide":
						if (b === 0)
							return {
								content: [
									{
										type: "text",
										text: "Error: Cannot divide by zero",
									},
								],
							};
						result = a / b;
						break;
				}
				return { content: [{ type: "text", text: String(result) }] };
			},
		);

		//Search Cargo Tool
		interface Cargo {
            id:number,
            nameSurname : string,
            phoneNumber : string,
            trackingNumber : string,
            branchName : string,
            branchCity : string,
            branchProvince : string,
            branchPhone: string,
            cargoStatus : string
		};
		
		cargo1:Cargo ={
			Id=1,
            nameSurname = "Ebru Keleş Acır",
            phoneNumber = "5327099653",
            trackingNumber = "535353535353",
            branchName = "Samandıra",
            branchCity = "İstanbul",
            branchProvince = "Sancaktepe",
            branchPhone = "2160000000",
            cargoStatus = "Kargonuz Teslim Alındı"
		};
		
		cargo2:Cargo ={
			Id=2,
            nameSurname = "Ebru Keleş Acır",
            phoneNumber = "5305554743",
            trackingNumber = "123123123123",
            branchName = "Uğur Mumcu",
            branchCity = "İstanbul",
            branchProvince = "Kartal",
            branchPhone = "2160000001",
            cargoStatus = "Transfer Merkezinde"
		};
		
		cargo3:Cargo ={
			Id=3,
            nameSurname = "Ebru Keleş Acır",
            phoneNumber = "5327099653",
            trackingNumber = "120012001200",
            branchName = "Sancaktepe",
            branchCity = "İstanbul",
            branchProvince = "Sancaktepe",
            branchPhone = "2160000002",
            cargoStatus = "Teslim Şubesinde"
		};
		
		this.server.tool(
			"search_cargo",
			{
				// operation: z.enum(["add", "subtract", "multiply", "divide"]),
				cargo_number: z.number(),
			},
			async ({ cargo_number }) => {
				let result: Cargo;
				switch (cargo_number) {
					case 535353535353:
						result = cargo1;
						break;
					case 535353535353:
						result = cargo2;
						break;
					case 535353535353:
						result = cargo3;
						break;
					
				}
				return { content: [{ type: "json", json: result }] };
			},
		);
	}
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/mcp") {
			return MyMCP.serve("/mcp").fetch(request, env, ctx);
		}

		return new Response("Not found", { status: 404 });
	},
};
